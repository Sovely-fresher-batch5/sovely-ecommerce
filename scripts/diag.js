import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from './src/constants.js';
dotenv.config();

async function diag() {
    try {
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        console.log("Constructed URI:", uri);
        await mongoose.connect(uri);
        console.log("Connected to database:", mongoose.connection.name);
        console.log("Host:", mongoose.connection.host);
        
        const productsCount = await mongoose.connection.db.collection('products').countDocuments();
        console.log("Products count in current DB:", productsCount);
        
        if (productsCount > 0) {
            const first = await mongoose.connection.db.collection('products').findOne();
            console.log("First product title:", first.title || first.name);
        }
        
        // Also check 'test' database just in case
        const testDb = mongoose.connection.useDb('test');
        const testCount = await testDb.collection('products').countDocuments();
        console.log("Products count in 'test' DB:", testCount);
        
        process.exit(0);
    } catch (e) {
        console.error("Diag failed:", e);
        process.exit(1);
    }
}

diag();
