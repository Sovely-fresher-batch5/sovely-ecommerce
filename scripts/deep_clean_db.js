import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function deepClean() {
    try {
        console.log("Connecting for deep clean...");
        // Use the fixed URI or a base URI
        const baseUri = "mongodb+srv://sovelyfresherbatch5_db_user:gnNGY2XFGhhNVhTy@cluster0.oime7md.mongodb.net/?appName=Cluster0";
        await mongoose.connect(baseUri);
        
        const dbsToClean = ['db_sovely', 'test'];
        
        for (const dbName of dbsToClean) {
            console.log(`Cleaning database: ${dbName}...`);
            const db = mongoose.connection.useDb(dbName);
            
            // Delete from 'products'
            const result = await db.collection('products').deleteMany({});
            console.log(`  - Deleted ${result.deletedCount} products from ${dbName}.products`);
            
            // Delete from 'categories' to be safe
            const catResult = await db.collection('categories').deleteMany({});
            console.log(`  - Deleted ${catResult.deletedCount} categories from ${dbName}.categories`);
        }
        
        console.log("✅ Deep clean complete!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Deep clean failed:", e);
        process.exit(1);
    }
}

deepClean();
