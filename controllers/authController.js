"use strict";

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const safe = (u) => ({
  id:       u._id,
  name:     u.name,
  email:    u.email,
  whatsapp: u.whatsapp,
  role:     u.role,
});

const register = async (req, res) => {
  try {
    const { name, email, password, whatsapp } = req.body;
    if (!name || !email || !password || !whatsapp)
      return res.status(400).json({ message: "Tous les champs sont requis." });

    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email déjà utilisé." });

    const user = await User.create({ name, email, password, whatsapp });
    return res.status(201).json({ token: signToken(user._id), user: safe(user) });
  } catch (err) {
    console.error("register:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email et mot de passe requis." });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Identifiants incorrects." });

    if (!user.isActive)
      return res.status(403).json({ message: "Compte désactivé." });

    return res.status(200).json({ token: signToken(user._id), user: safe(user) });
  } catch (err) {
    console.error("login:", err.message);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getMe = (req, res) => res.status(200).json({ user: req.user });

module.exports = { register, login, getMe };
