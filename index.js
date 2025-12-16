require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/users.routes");
const servicesRoutes = require("./src/routes/services.routes");
const decoratorsRoutes = require("./src/routes/decorators.routes");
const bookingsRoutes = require("./src/routes/bookings.routes"); // ✅ ADD

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => res.json({ ok: true, name: "StyleDecor API" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/decorators", decoratorsRoutes);
app.use("/api/bookings", bookingsRoutes); // ✅ ADD

app.use((req, res) =>
  res.status(404).json({ ok: false, message: "Route not found" })
);

async function start() {
  await connectDB(process.env.MONGODB_URI);
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log("✅ Server running on", PORT));
}
start();
