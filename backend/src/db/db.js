import mongoose from "mongoose";

// Robust MongoDB connection for Serverless (Vercel)
export const connectDB = async () => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState >= 1) {
        console.log("Using existing MongoDB connection");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // Options to ensure robust connection in serverless env
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
        });
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection failed:", err);
        // Don't exit process in serverless, just throw so the specific request fails
        throw err;
    }
}
