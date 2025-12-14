require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

/* ----------------------------- Middleware ----------------------------- */
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());


/* ------------------------------ Routes -------------------------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    name: "StyleDecor API",
    env: process.env.NODE_ENV || "unknown",
    time: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "not_connected",
  });
});

/* --------------------------- Error Handling --------------------------- */
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    ok: false,
    message: "Internal server error",
  });
});

/* -------------------------- DB + Server Start ------------------------- */
async function start() {
  const PORT = Number(process.env.PORT) || 5000;
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌ Missing MONGODB_URI in .env");
    process.exit(1);
  }

  try {
    // Mongoose 7+ doesn't need useNewUrlParser/useUnifiedTopology
    await mongoose.connect(MONGODB_URI);

    console.log("✅ MongoDB connected:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect MongoDB:", err.message);
    process.exit(1);
  }
}

start();

/* ---------------------- Graceful Shutdown (nice) ---------------------- */
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("🛑 MongoDB connection closed");
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
});