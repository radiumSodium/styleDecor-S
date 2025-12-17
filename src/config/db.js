const mongoose = require("mongoose");

let isConnected = false;

module.exports = async function connectDB(uri) {
  if (isConnected) return;

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    // These options are safe; Mongoose ignores unknown options in newer versions
    serverSelectionTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("✅ MongoDB connected");
};
// const mongoose = require("mongoose");

// async function connectDB(uri) {
//   mongoose.set("strictQuery", true);
//   await mongoose.connect(uri, {
//     serverSelectionTimeoutMS: 10000,
//     socketTimeoutMS: 45000,
//   });
//   return mongoose.connection;
// }

// module.exports = connectDB;
