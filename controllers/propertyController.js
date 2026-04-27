"use strict";

const Property       = require("../models/Property");
const { cloudinary } = require("../config/cloudinary");

const createProperty = async (req, res) => {
  try {
    const { title, type, listingType, price, location, description, contactPhone } = req.body;
    if (!title || !type || !listingType || !price || !location || !contactPhone)
      return res.status(400).json({ message: "Champs obligatoires manquants." });

    const images = req.files ? req.files.map((f) => f.path) : [];

    const property = await Property.create({
      owner: req.user._id,
      title, type, listingType,
      price: Number(price),
      location,
      description: description || "",
      contactPhone,
      images,
    });

    return res.status(201).json({ message: "Annonce publiée.", property });
  } catch (err) {
    console.error("createProperty:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getProperties = async (req, res) => {
  try {
    const { type, listingType, maxPrice, location, page = 1, limit = 12 } = req.query;

    const filter = { status: "active" };
    if (type)        filter.type        = type;
    if (listingType) filter.listingType = listingType;
    if (maxPrice)    filter.price       = { $lte: Number(maxPrice) };
    if (location)    filter.location    = { $regex: location, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name whatsapp")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filter),
    ]);

    return res.status(200).json({
      properties,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("getProperties:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ properties });
  } catch (err) {
    console.error("getMyProperties:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, status: "active" },
      { $inc: { views: 1 } },
      { new: true }
    ).populate("owner", "name whatsapp email");

    if (!property) return res.status(404).json({ message: "Annonce introuvable." });
    return res.status(200).json({ property });
  } catch (err) {
    console.error("getPropertyById:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Annonce introuvable." });

    const isOwner = property.owner.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== "admin")
      return res.status(403).json({ message: "Non autorisé." });

    for (const url of property.images) {
      try {
        const parts    = url.split("/");
        const filename = parts[parts.length - 1].split(".")[0];
        await cloudinary.uploader.destroy(`immociv/${filename}`);
      } catch (_) {}
    }

    await property.deleteOne();
    return res.status(200).json({ message: "Annonce supprimée." });
  } catch (err) {
    console.error("deleteProperty:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { createProperty, getProperties, getMyProperties, getPropertyById, deleteProperty };
