"use strict";

const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name:     { type: String,  required: [true, "Nom requis"],      trim: true },
    email:    { type: String,  required: [true, "Email requis"],    unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Email invalide"] },
    password: { type: String,  required: [true, "Password requis"], minlength: [6, "Min 6 caractères"] },
    whatsapp: { type: String,  required: [true, "WhatsApp requis"], trim: true },
    role:     { type: String,  enum: ["user", "admin"],             default: "user" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
