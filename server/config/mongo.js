import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process with failure
    }
};

export const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
