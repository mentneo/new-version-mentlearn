import mongoose from 'mongoose';

export const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing in environment');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { autoIndex: true });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};
