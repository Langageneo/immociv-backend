"use strict";

const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:        { type: String,  required: [true, "Titre requis"],        trim: true, maxlength: 120 },
    type:         { type: String,  required: [true, "Type requis"],         enum: ["maison", "appartement", "terrain"] },
    listingType:  { type: String,  required: [true, "Transaction requise"], enum: ["vente", "location"] },
    price:        { type: Number,  required: [true, "Prix requis"],         min: 0 },
    location:     { type: String,  required: [true, "Localisation requise"],trim: true },
    description:  { type: String,  trim: true, maxlength: 1000, default: "" },
    images:       { type: [String], default: [] },
    contactPhone: { type: String,  required: [true, "Contact requis"],      trim: true },
    views:        { type: Number,  default: 0 },
    status:       { type: String,  enum: ["active", "inactive"],            default: "active" },
  },
  { timestamps: true }
);

propertySchema.index({ type: 1, listingType: 1, status: 1 });
propertySchema.index({ location: "text", title: "text" });

module.exports = mongoose.model("Property", propertySchema);
