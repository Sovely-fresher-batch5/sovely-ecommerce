import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { fakerEN_IN as faker } from '@faker-js/faker'; // Indian locale for realistic data
import { DB_NAME } from './src/constants.js';

dotenv.config();

const NUM_USERS = 300;
const NUM_PRODUCTS = 3000;
const NUM_CATEGORIES = 15;

// Helper: Generate valid Indian GSTIN
const generateGSTIN = () => {
    const stateCode = faker.number.int({ min: 10, max: 37 }).toString();
    const panChars = faker.string.alpha({ length: 5, casing: 'upper' });
    const panNums = faker.string.numeric({ length: 4 });
    const panChar2 = faker.string.alpha({ length: 1, casing: 'upper' });
    const entity = faker.number.int({ min: 1, max: 9 }).toString();
    const checksum = faker.string.alphanumeric({ length: 1, casing: 'upper' });
    return `${stateCode}${panChars}${panNums}${panChar2}${entity}Z${checksum}`;
};

// Helper: Tax Breakdown
const calculateTax = (inclusivePrice, taxPercentage = 18) => {
    const basePrice = inclusivePrice / (1 + taxPercentage / 100);
    const taxAmount = inclusivePrice - basePrice;
    return { basePrice: Number(basePrice.toFixed(2)), taxAmount: Number(taxAmount.toFixed(2)) };
};

const seedDatabase = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log('✅ Connected.');

        console.log('🧹 Wiping the database clean to prevent duplicates...');
        await mongoose.connection.db.dropDatabase();
        console.log('💥 Database wiped!');

        // 1. GENERATE CATEGORIES
        console.log('📦 Generating Categories...');
        const categories = Array.from({ length: NUM_CATEGORIES }).map(() => ({
            _id: new mongoose.Types.ObjectId(),
            name: `${faker.commerce.department()} Supplies`,
            slug: faker.helpers.slugify(faker.commerce.department()).toLowerCase(),
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        await mongoose.connection.collection('categories').insertMany(categories);

        // 2. GENERATE USERS
        console.log(`👥 Generating ${NUM_USERS} Users...`);
        // Pre-hashed 'password123'
        const mockHash = await bcrypt.hash('password123', 10);
        const staticUsers = [
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Sovely Super Admin',
                email: 'admin@sovely.com',
                phoneNumber: '9999999999',
                passwordHash: mockHash, 
                role: 'ADMIN',
                accountType: 'B2B',
                companyName: 'Sovely HQ',
                gstin: generateGSTIN(),
                isVerifiedB2B: true,
                walletBalance: 0,
                addresses: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: new mongoose.Types.ObjectId(),
                name: 'Test B2B Buyer',
                email: 'buyer@sovely.com',
                phoneNumber: '8888888888',
                passwordHash: mockHash, 
                role: 'CUSTOMER',
                accountType: 'B2B',
                companyName: 'Test Corp India',
                gstin: generateGSTIN(),
                isVerifiedB2B: true,
                walletBalance: 100000, // Gave them a nice wallet buffer for testing!
                addresses: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        ];
        // Insert our guaranteed test accounts first
        await mongoose.connection.collection('users').insertMany(staticUsers);
        const users = Array.from({ length: NUM_USERS }).map(() => {
            const isB2B = faker.datatype.boolean();
            return {
                _id: new mongoose.Types.ObjectId(),
                name: faker.person.fullName(),
                email: faker.internet.email(),
                phoneNumber: faker.string.numeric({ length: 10 }),
                passwordHash: mockHash,
                role: 'CUSTOMER',
                accountType: isB2B ? 'B2B' : 'B2C',
                companyName: isB2B ? faker.company.name() : '',
                gstin: isB2B ? generateGSTIN() : '',
                isVerifiedB2B: isB2B,
                walletBalance: faker.number.int({ min: 0, max: 100000 }),
                addresses: [{
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    zip: faker.location.zipCode(),
                    isDefault: true,
                }],
                createdAt: faker.date.past(),
                updatedAt: new Date(),
            };
        });
        
        // Insert Users in chunks of 1000
        for (let i = 0; i < users.length; i += 1000) {
            await mongoose.connection.collection('users').insertMany(users.slice(i, i + 1000));
        }

        // 3. GENERATE PRODUCTS
        console.log(`🛒 Generating ${NUM_PRODUCTS} Products...`);
        const products = Array.from({ length: NUM_PRODUCTS }).map(() => {
            const sellPrice = faker.number.int({ min: 100, max: 5000 });
            const comparePrice = Math.floor(sellPrice * faker.number.float({ min: 1.1, max: 1.5 }));
            return {
                _id: new mongoose.Types.ObjectId(),
                sku: `SKU-${faker.string.numeric({ length: 8 })}`,
                title: faker.commerce.productName(),
                descriptionHTML: `<p>${faker.commerce.productDescription()}</p>`,
                vendor: faker.company.name(),
                categoryId: faker.helpers.arrayElement(categories)._id,
                images: [{ url: `https://picsum.photos/seed/${faker.number.int(1000)}/400/400`, position: 0 }],
                platformSellPrice: sellPrice,
                compareAtPrice: comparePrice,
                discountPercent: Math.round(((comparePrice - sellPrice) / comparePrice) * 100),
                status: 'active',
                moq: faker.helpers.arrayElement([1, 5, 10, 50]),
                inventory: { stock: faker.number.int({ min: 10, max: 1000 }), alertThreshold: 20 },
                averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
                reviewCount: faker.number.int({ min: 0, max: 500 }),
                taxSlab: 18,
                hsnCode: faker.string.numeric({ length: 4 }),
                createdAt: faker.date.past(),
                updatedAt: new Date(),
            };
        });

        for (let i = 0; i < products.length; i += 1000) {
            await mongoose.connection.collection('products').insertMany(products.slice(i, i + 1000));
        }

        // 4. GENERATE ORDERS & INVOICES
        console.log('🧾 Generating Orders & Invoices...');
        const orders = [];
        const invoices = [];
        
        // ADD THESE TWO COUNTERS HERE:
        let orderCounter = 100000;
        let invoiceCounter = 100000;
        
        // Give ~70% of users some orders
        const activeUsers = faker.helpers.arrayElements(users, Math.floor(NUM_USERS * 0.7));

        activeUsers.forEach(user => {
            const numOrders = faker.number.int({ min: 1, max: 5 });
            
            for (let i = 0; i < numOrders; i++) {
                const orderId = new mongoose.Types.ObjectId();
                const orderProducts = faker.helpers.arrayElements(products, faker.number.int({ min: 1, max: 4 }));
                
                let globalSubtotal = 0;
                let globalTaxtotal = 0;
                let globalGrandtotal = 0;
                const itemsSnapshot = [];
                
                orderProducts.forEach(p => {
                    const qty = faker.number.int({ min: p.moq, max: p.moq + 10 });
                    const { basePrice, taxAmount } = calculateTax(p.platformSellPrice, 18);
                    
                    globalSubtotal += basePrice * qty;
                    globalTaxtotal += taxAmount * qty;
                    globalGrandtotal += p.platformSellPrice * qty;
                    
                    itemsSnapshot.push({
                        productId: p._id,
                        sku: p.sku,
                        title: p.title,
                        hsnCode: p.hsnCode,
                        taxSlab: 18,
                        basePrice,
                        taxAmountPerUnit: taxAmount,
                        qty,
                        totalItemPrice: Number((p.platformSellPrice * qty).toFixed(2))
                    });
                });
                
                const orderDate = faker.date.recent({ days: 100 });
                
                // USE THE COUNTERS INSTEAD OF FAKER HERE:
                const mockOrderStr = `MOCK-ORD-${orderCounter++}`;
                const mockInvoiceStr = `MOCK-INV-${invoiceCounter++}`;
                
                orders.push({
                    _id: orderId,
                    orderId: mockOrderStr,
                    userId: user._id,
                    status: faker.helpers.arrayElement(['PROCESSING', 'SHIPPED', 'DELIVERED']),
                    paymentTerms: 'DUE_ON_RECEIPT',
                    paymentMethod: faker.helpers.arrayElement(['RAZORPAY', 'WALLET']),
                    subTotal: Number(globalSubtotal.toFixed(2)),
                    taxTotal: Number(globalTaxtotal.toFixed(2)),
                    grandTotal: Number(globalGrandtotal.toFixed(2)),
                    items: itemsSnapshot,
                    orderDate,
                    createdAt: orderDate,
                    updatedAt: orderDate
                });
                
                invoices.push({
                    _id: new mongoose.Types.ObjectId(),
                    invoiceNumber: mockInvoiceStr,
                    userId: user._id,
                    orderId: orderId,
                    invoiceType: 'ORDER_BILL',
                    buyerDetails: {
                        companyName: user.companyName,
                        gstin: user.gstin,
                        billingAddress: user.addresses[0].street
                    },
                    paymentTerms: 'DUE_ON_RECEIPT',
                    paymentMethod: 'RAZORPAY',
                    subTotal: Number(globalSubtotal.toFixed(2)),
                    taxBreakdown: {
                        cgstTotal: Number((globalTaxtotal / 2).toFixed(2)),
                        sgstTotal: Number((globalTaxtotal / 2).toFixed(2)),
                        igstTotal: 0
                    },
                    grandTotal: Number(globalGrandtotal.toFixed(2)),
                    dueDate: new Date(orderDate.getTime() + 15 * 24 * 60 * 60 * 1000), // +15 days
                    status: 'PAID',
                    createdAt: orderDate,
                    updatedAt: orderDate
                });
            }
        });

        for (let i = 0; i < orders.length; i += 1000) {
            await mongoose.connection.collection('orders').insertMany(orders.slice(i, i + 1000));
        }
        for (let i = 0; i < invoices.length; i += 1000) {
            await mongoose.connection.collection('invoices').insertMany(invoices.slice(i, i + 1000));
        }

        console.log('✅ Data Generation Complete! Database is populated.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
