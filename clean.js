import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = 'db_sovely'; // Make sure this matches your constants/seed files

const wipeDatabase = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        const uri = `${process.env.MONGODB_URI}/${DB_NAME}`;
        await mongoose.connect(uri);
        
        console.log(`⚠️  WARNING: Dropping database "${DB_NAME}"...`);
        
        // This completely obliterates the database, including all data and indexes
        await mongoose.connection.db.dropDatabase();
        
        console.log('✅ Database completely wiped! A clean slate awaits.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to wipe database:', error);
        process.exit(1);
    }
};

wipeDatabase();
