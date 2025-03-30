// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invControllers.js")
const invValidate = require("../utilities/inventory-validation.js")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);



// Route to build inventory by detail view
router.get("/detail/:invId", invController.buildByInventoryId);


router.get("/", invController.buildManagementView)

router.get("/add-classification", invController.buildAddClassificationView)

router.get("/add-inventory", invController.buildAddInventoryView)

// Process the add classification form
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)
module.exports = router;