"use strict";

const User     = require("../models/User");
const Property = require("../models/Property");

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalProps, activeProps, inactiveProps, viewsAgg, byType] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Property.countDocuments(),
      Property.countDocuments({ status: "active" }),
      Property.countDocuments({ status: "inactive" }),
      Property.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
      Property.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
    ]);
    return res.status(200).json({
      totalUsers,
      totalProperties:    totalProps,
      activeProperties:   activeProps,
      inactiveProperties: inactiveProps,
      totalViews:         viewsAgg[0]?.total || 0,
      byType,
    });
  } catch (err) {
    console.error("getStats:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getAllPropertiesAdmin = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(filter).populate("owner", "name email whatsapp").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(filter),
    ]);
    return res.status(200).json({ properties, total });
  } catch (err) {
    console.error("getAllPropertiesAdmin:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const togglePropertyStatus = async (req, res) => {
  try {
    const prop = await Property.findById(req.params.id);
    if (!prop) return res.status(404).json({ message: "Annonce introuvable." });
    prop.status = prop.status === "active" ? "inactive" : "active";
    await prop.save();
    return res.status(200).json({ message: `Annonce ${prop.status}.`, property: prop });
  } catch (err) {
    console.error("togglePropertyStatus:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const deletePropertyAdmin = async (req, res) => {
  try {
    const prop = await Property.findByIdAndDelete(req.params.id);
    if (!prop) return res.status(404).json({ message: "Annonce introuvable." });
    return res.status(200).json({ message: "Annonce supprimée." });
  } catch (err) {
    console.error("deletePropertyAdmin:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (err) {
    console.error("getAllUsers:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin")
      return res.status(404).json({ message: "Utilisateur introuvable." });
    user.isActive = !user.isActive;
    await user.save();
    return res.status(200).json({ message: `Compte ${user.isActive ? "activé" : "désactivé"}.` });
  } catch (err) {
    console.error("toggleUserStatus:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = { getStats, getAllPropertiesAdmin, togglePropertyStatus, deletePropertyAdmin, getAllUsers, toggleUserStatus };
