require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/users.routes");

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.json({ ok: true, name: "StyleDecor API" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => res.status(404).json({ ok: false, message: "Route not found" }));

async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(process.env.PORT || 5000, () =>
    console.log("✅ Server running on", process.env.PORT || 5000)
  );
}
start();