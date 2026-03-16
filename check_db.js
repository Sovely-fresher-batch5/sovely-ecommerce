const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Attempt to load .env from parent directory
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUri = envContent.match(/MONGODB_URI=(.+)/)[1].trim();

async function run() {
    try {
        console.log('Attempting to connect to:', mongoUri);
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');
        const db = mongoose.connection.db;
        
        // Check collections
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const productsCount = await db.collection('products').countDocuments();
        console.log('Total products in "products" collection:', productsCount);
        
        if (productsCount > 0) {
            const sample = await db.collection('products').findOne({});
            console.log('Sample product keys:', Object.keys(sample));
            console.log('Sample product SKU:', sample.sku);
            console.log('Sample product Title:', sample.title);
            
            const skus = await db.collection('products').find({}).limit(5).project({ sku: 1, title: 1 }).toArray();
            console.log('Sample SKUs:', JSON.stringify(skus, null, 2));
        } else {
            console.log('WARNING: The products collection is empty!');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err);
        process.exit(1);
    }
}
run();
