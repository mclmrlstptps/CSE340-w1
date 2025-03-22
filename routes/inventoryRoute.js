// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invControllers.js")


// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory by detail view
router.get("/detail/:invId", invController.buildByInventoryId);

module.exports = router;