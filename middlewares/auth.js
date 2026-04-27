"use strict";

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h || !h.startsWith("Bearer "))
      return res.status(401).json({ message: "Token manquant." });

    const decoded = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");

    if (!user)          return res.status(401).json({ message: "Utilisateur introuvable." });
    if (!user.isActive) return res.status(403).json({ message: "Compte désactivé." });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

module.exports = { protect };
