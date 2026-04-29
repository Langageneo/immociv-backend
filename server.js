"use strict";

require("dotenv").config();

const express        = require("express");
const cors           = require("cors");
const connectDB      = require("./config/db");
const authRoutes     = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const adminRoutes    = require("./routes/adminRoutes");

connectDB();

const app = express();

app.use(cors({
  origin: ["https://immociv-frontend.vercel.app", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",       authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/admin",      adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "🏠 ImmoCIV API", version: "2.0.0", status: "online" });
});

app.use((req, res) => res.status(404).json({ message: "Route introuvable." }));

app.use((err, req, res, next) => {
  console.error("Erreur globale:", err.stack);
  res.status(500).json({ message: "Erreur serveur interne." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ImmoCIV Backend démarré — port ${PORT}`));
