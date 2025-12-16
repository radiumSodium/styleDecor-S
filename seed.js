require("dotenv").config();
const connectDB = require("./src/config/db");
const Service = require("./src/models/Service");

const services = require("./src/seed/services.seed");

async function run() {
  await connectDB(process.env.MONGODB_URI);

  // If you want "seed once", prevent duplicates by checking count
  const count = await Service.countDocuments();
  if (count > 4) {
    console.log("✅ Services already exist. Skipping seed.");
    process.exit(0);
  }

  await Service.insertMany(services);
  console.log(`✅ Seeded ${services.length} services.`);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
