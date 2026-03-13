import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        
        console.log("Databases found:", dbs.databases.map(d => d.name));
        
        for (const d of dbs.databases) {
            const db = mongoose.connection.useDb(d.name);
            const colls = await db.listCollections().toArray();
            for (const c of colls) {
                const count = await db.collection(c.name).countDocuments();
                if (count > 0) {
                    console.log(`DB: ${d.name}, Collection: ${c.name}, Count: ${count}`);
                    // Check first doc to see if it's a product
                    if (c.name.toLowerCase().includes('product') || c.name.toLowerCase().includes('item')) {
                        const sample = await db.collection(c.name).findOne();
                        console.log(`  Sample Title/Name: ${sample.title || sample.name || 'N/A'}`);
                    }
                }
            }
        }
        process.exit(0);
    } catch (e) {
        console.error("Check failed:", e);
        process.exit(1);
    }
}

check();
