import mongoose from "mongoose";

export const getMongoUri = () => process.env.MONGO_URI || process.env.MONGODB_URI;

const connectDB = async () => {
    try {
        const mongoUri = getMongoUri();

        if (!mongoUri) {
            throw new Error("MONGO_URI or MONGODB_URI is required in backend environment variables");
        }

        await mongoose.connect(mongoUri);
        console.log("MongoDB connected Successfully")
    }
    catch (error) {
        console.error(`Error:${error.message}`)
    }
}

export default connectDB;