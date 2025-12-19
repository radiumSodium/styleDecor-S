const mongoose = require("mongoose");

// Cache across Vercel lambda reuse
let cached = global.__mongoose_cache__;
if (!cached) {
  cached = global.__mongoose_cache__ = { conn: null, promise: null };
}

module.exports = async function connectDB(uri) {
  if (!uri) throw new Error("MONGODB_URI is missing");

  // already connected
  if (cached.conn) return cached.conn;

  mongoose.set("strictQuery", true);

  // first time: create one shared promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
};
