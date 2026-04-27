"use strict";

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB erreur : ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
