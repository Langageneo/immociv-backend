"use strict";

const express  = require("express");
const router   = express.Router();
const {
  getStats,
  getAllPropertiesAdmin,
  togglePropertyStatus,
  deletePropertyAdmin,
  getAllUsers,
  toggleUserStatus,
} = require("../controllers/adminController");
const { protect } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/isAdmin");

router.use(protect, isAdmin);

router.get("/stats",                   getStats);
router.get("/properties",              getAllPropertiesAdmin);
router.patch("/properties/:id/toggle", togglePropertyStatus);
router.delete("/properties/:id",       deletePropertyAdmin);
router.get("/users",                   getAllUsers);
router.patch("/users/:id/toggle",      toggleUserStatus);

module.exports = router;
