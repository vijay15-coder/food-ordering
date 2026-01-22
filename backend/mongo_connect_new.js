// MongoDB Connection with extended timeouts and retries
const connectMongo = async () => {
  const baseUri = process.env.MONGO_URI || 'mongodb://localhost:27017/food';
  try {
    console.log('Attempting MongoDB connection...');
    await mongoose.connect(baseUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    console.log('✅ MongoDB connected successfully!');
    return;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('Retrying in 10 seconds...');
    setTimeout(connectMongo, 10000);
  }
};

connectMongo();
