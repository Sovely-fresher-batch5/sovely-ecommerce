import mongoose from "mongoose";
import fs from "fs";
import csv from "csv-parser";
import * as xlsx from "xlsx";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Helper scoped INSIDE the file, but cache scoped locally inside functions when needed
const parseCategories = async (categoryString) => {
    if (!categoryString) return null;
    const parts = categoryString.split('>').map(p => p.trim()).filter(p => p);
    if (parts.length === 0) return null;

    let parentId = null;
    let lastCategoryId = null;

    for (const part of parts) {
        let cat = await Category.findOne({ name: part, parentCategoryId: parentId });
        if (!cat) {
            cat = await Category.create({ name: part, parentCategoryId: parentId });
        }
        parentId = cat._id;
        lastCategoryId = cat._id;
    }
    return lastCategoryId;
};

const getProducts = asyncHandler(async (req, res) => {
    // 1. Extract all possible filters from the frontend
    const { 
        page = 1, limit = 24, query, categoryId, 
        minPrice, maxPrice, saleOnly, shipping, minRating, sort 
    } = req.query;

    const filter = {};

    // 2. Apply Filters
    if (query) {
        // Use the new high-speed text index we just created
        filter.$text = { $search: query };
    }

    if (categoryId && categoryId !== 'All') {
        filter.categoryId = new mongoose.Types.ObjectId(categoryId);
    }

    if (saleOnly === 'true') {
        filter.discountPercent = { $gt: 0 };
    }

    if (minPrice || maxPrice) {
        filter.platformSellPrice = {};
        if (minPrice) filter.platformSellPrice.$gte = Number(minPrice);
        if (maxPrice) filter.platformSellPrice.$lte = Number(maxPrice);
    }

    if (minRating) {
        filter.averageRating = { $gte: Number(minRating) };
    }

    if (shipping) {
        // Expecting a comma-separated string like "3-5,7-14"
        const shippingArray = shipping.split(',');
        filter.shippingDays = { $in: shippingArray };
    }

    // 3. Determine Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'price-asc') sortOption = { platformSellPrice: 1 };
    if (sort === 'price-desc') sortOption = { platformSellPrice: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };
    if (sort === 'reviews') sortOption = { reviewCount: -1 };

    // 4. Execute Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
        .populate("categoryId", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    return res.status(200).json(
        new ApiResponse(200, {
            products,
            pagination: { 
                total, 
                page: parseInt(page), 
                pages: Math.ceil(total / parseInt(limit)) 
            }
        }, "Products fetched successfully")
    );
});

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) throw new ApiError(400, "Invalid product ID");

    const product = await Product.findById(productId).populate("categoryId", "name");
    if (!product) throw new ApiError(404, "Product not found");

    return res.status(200).json(new ApiResponse(200, product, "Product fetched successfully"));
});

// Massive Optimization: Querying the pre-calculated discount field
const getBestDeals = asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const deals = await Product.find({ status: "active", discountPercent: { $gt: 0 } })
        .sort({ discountPercent: -1 })
        .limit(limit)
        .populate("categoryId", "name");

    return res.status(200).json(new ApiResponse(200, deals, "Best deals fetched successfully"));
});

const getAdminProducts = asyncHandler(async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 }).limit(50);
    return res.status(200).json(new ApiResponse(200, products, "Admin products fetched"));
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
    const { platformSellPrice, stock, status } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) throw new ApiError(404, "Product not found");

    if (platformSellPrice !== undefined) product.platformSellPrice = platformSellPrice;
    if (status !== undefined) product.status = status;
    
    // DEFENSIVE FIX: Ensure inventory object exists before assigning stock
    if (stock !== undefined) {
        if (!product.inventory) product.inventory = {}; 
        product.inventory.stock = stock;
    }

    await product.save(); 
    return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

// Optimized Bulk Upload using bulkWrite and local caching
const bulkUploadProducts = asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new ApiError(400, "No file uploaded");

    const filePath = file.path;
    const productsMap = new Map();
    const localCategoryCache = new Map(); // Local scoped cache, prevents memory leaks!

    const processRow = (row) => {
        const handle = row['Handle'] || row['handle'];
        if (!handle) return;

        if (!productsMap.has(handle)) {
            productsMap.set(handle, {
                handle,
                title: row['Title'] || row['title'],
                descriptionHTML: row['Body (HTML)'] || row['bodyHtml'] || row['description'],
                vendor: row['Vendor'] || row['vendor'],
                productCategory: row['Product Category'] || row['category'],
                productType: row['Type'] || row['type'],
                tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [],
                sku: row['Variant SKU'] || row['sku'] || handle,
                platformSellPrice: parseFloat(row['Variant Price'] || row['Price'] || row['price']) || 0,
                compareAtPrice: parseFloat(row['Variant Compare At Price'] || row['compareAtPrice']) || null,
                status: (row['Status'] || row['status'] || 'active').toLowerCase(),
                images: []
            });
        }

        const product = productsMap.get(handle);
        const imageSrc = row['Image Src'] || row['imageSrc'];
        if (imageSrc) {
            product.images.push({
                url: imageSrc,
                position: parseInt(row['Image Position'] || row['imagePosition'], 10) || product.images.length + 1,
                altText: row['Image Alt Text'] || row['imageAltText'] || ''
            });
        }
    };

    try {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            await new Promise((resolve, reject) => {
                fs.createReadStream(filePath).pipe(csv()).on('data', processRow).on('end', resolve).on('error', reject);
            });
        } else {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).forEach(processRow);
        }

        let defCat = await Category.findOne({ name: "Uncategorized" });
        if (!defCat) defCat = await Category.create({ name: "Uncategorized", parentCategoryId: null });

        const bulkOperations = [];

        for (const data of productsMap.values()) {
            if (!data.title) continue;

            // Resolve Category
            let finalCatId = defCat._id;
            if (data.productCategory) {
                if (localCategoryCache.has(data.productCategory)) {
                    finalCatId = localCategoryCache.get(data.productCategory);
                } else {
                    const parsedId = await parseCategories(data.productCategory);
                    finalCatId = parsedId || defCat._id;
                    localCategoryCache.set(data.productCategory, finalCatId);
                }
            }

            let discountPercent = 0;
            if (data.compareAtPrice && data.compareAtPrice > data.platformSellPrice) {
                discountPercent = Math.round(((data.compareAtPrice - data.platformSellPrice) / data.compareAtPrice) * 100);
            }

            // CLEAN THE DATA: Explicitly map only the fields that exist in our schema
            const cleanProductData = {
                sku: data.sku,
                title: data.title,
                descriptionHTML: data.descriptionHTML,
                vendor: data.vendor,
                productType: data.productType,
                tags: data.tags,
                categoryId: finalCatId,
                images: data.images,
                platformSellPrice: data.platformSellPrice,
                compareAtPrice: data.compareAtPrice,
                discountPercent: discountPercent,
                status: data.status,
                inventory: { stock: 50, alertThreshold: 10 },
                shippingDays: '3-5', // Defaulting new products to 3-5 days
                averageRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // Mocking starting rating between 3.5 and 5.0
                reviewCount: Math.floor(Math.random() * 50) + 5 // Mocking starting reviews
            };

            bulkOperations.push({
                updateOne: {
                    filter: { sku: data.sku },
                    update: { $set: cleanProductData },
                    upsert: true
                }
            });
        }

        // Execute all DB writes in one massive batch!
        if (bulkOperations.length > 0) {
            await Product.bulkWrite(bulkOperations);
        }

        fs.unlinkSync(filePath); // Cleanup

        return res.status(200).json(new ApiResponse(200, { total: bulkOperations.length }, "Products uploaded successfully"));
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw new ApiError(500, "Error processing bulk upload: " + error.message);
    }
});

const generateSampleTemplate = asyncHandler(async (req, res) => {
    // Keeping your exact template generation logic intact
    const headers = "Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option1 Linked To,Option2 Name,Option2 Value,Option2 Linked To,Option3 Name,Option3 Value,Option3 Linked To,Variant SKU,Variant Grams,Variant Inventory Tracker,Variant Inventory Policy,Variant Fulfillment Service,Variant Price,Variant Compare At Price,Variant Requires Shipping,Variant Taxable,Unit Price Total Measure,Unit Price Total Measure Unit,Unit Price Base Measure,Unit Price Base Measure Unit,Variant Barcode,Image Src,Image Position,Image Alt Text,Gift Card,SEO Title,SEO Description,Google Shopping / Google Product Category,Google Shopping / Gender,Google Shopping / Age Group,Google Shopping / MPN,Google Shopping / Condition,Google Shopping / Custom Product,Google Shopping / Custom Label 0,Google Shopping / Custom Label 1,Google Shopping / Custom Label 2,Google Shopping / Custom Label 3,Google Shopping / Custom Label 4,Variant Image,Variant Weight Unit,Variant Tax Code,Cost per item,Included / India,Price / India,Compare At Price / India,Status";
    const sampleRow = "\nwhite-waterproof-phone-pouch,\"White Waterproof Phone Pouch Bag\",\"<p>Protect your phone underwater!</p>\",Sovely,Electronics > Communications > Telephony > Mobile Phone Accessories,Mobile Covers,\"Mobile Accessories, monsoon, Waterproof\",TRUE,Title,Default Title,,,,,,,,SHIRT-001,168,shopify,deny,manual,78,234,TRUE,TRUE,,,,,,https://example.com/image1.jpg,1,,FALSE,Shop Waterproof Phone Pouch,\"Protect your phone from water!\",2353,,,,,,,,,,,,g,,,TRUE,,,active";
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sample_products_template.csv');
    return res.status(200).send(headers + sampleRow);
});

export { getProducts, getProductById, getBestDeals, getAdminProducts, bulkUploadProducts, generateSampleTemplate };