import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DB_NAME } from './src/constants.js'; // Adjust path if needed

// Load env variables
dotenv.config();

const nukeDatabase = async () => {
    // 🚨 SAFETY FIRST: Never run this in production!
    if (process.env.NODE_ENV === 'production') {
        console.error('🛑 ABORT: You are running in a production environment. I will not let you delete the database.');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        
        console.log(`Connected to DB Host: ${connectionInstance.connection.host}`);
        console.log('Initiating wipe sequence...');

        // This instantly drops the entire database (collections, documents, indexes—everything)
        await mongoose.connection.db.dropDatabase();
        
        console.log('💥 BOOM! Database has been completely wiped clean.');
        process.exit(0);

    } catch (error) {
        console.error('Failed to wipe the database:', error);
        process.exit(1);
    }
};

nukeDatabase();
