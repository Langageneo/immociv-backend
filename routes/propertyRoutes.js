"use strict";

const express  = require("express");
const router   = express.Router();
const {
  createProperty,
  getProperties,
  getMyProperties,
  getPropertyById,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect } = require("../middlewares/auth");
const { upload }  = require("../config/cloudinary");

router.get("/",          getProperties);
router.get("/user/mine", protect, getMyProperties);
router.get("/:id",       getPropertyById);
router.post("/",         protect, upload.array("images", 6), createProperty);
router.delete("/:id",    protect, deleteProperty);

module.exports = router;
