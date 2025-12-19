require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/users.routes");
const servicesRoutes = require("./src/routes/services.routes");
const decoratorsRoutes = require("./src/routes/decorators.routes");
const bookingsRoutes = require("./src/routes/bookings.routes");
const paymentsRoutes = require("./src/routes/payments.routes");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

async function ensureDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }
  await connectDB(process.env.MONGODB_URI);
}

app.use("/api", async (req, res, next) => {
  try {
    await ensureDB();
    next();
  } catch (err) {
    console.error("❌ DB connect error:", err.message);
    return res
      .status(500)
      .json({ ok: false, message: "Database connection failed" });
  }
});

app.get("/", (req, res) => res.json({ ok: true, name: "StyleDecor API" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, db: "connected", time: new Date().toISOString() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/decorators", decoratorsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/payments", paymentsRoutes);

app.use((req, res) =>
  res.status(404).json({ ok: false, message: "Route not found" })
);

module.exports = app;

if (require.main === module) {
  (async () => {
    try {
      await ensureDB();
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log("✅ Server running on", PORT));
    } catch (err) {
      console.error("❌ Failed to start server:", err);
      process.exit(1);
    }
  })();
}
