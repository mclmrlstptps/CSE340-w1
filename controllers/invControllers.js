const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

/* ***************************
 *  Build inventory by detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.invId
    const data = await invModel.getInventoryByInventoryId(inv_id)
    let nav = await utilities.getNav()
    

    if(!data || data.length ===0){
        req.flash("notice", "Sorry we couldn't find that vehicle")
        return res.redirect("/inv")
    }

    const vehicleData = data[0]
    const vehicleName = `${vehicleData.inv_make} ${vehicleData.inv_model}`

    res.render("inventory/detail", {
        title: vehicleName,
        nav,
        vehicle: vehicleData
    })
}


/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
    try {
      const nav = await utilities.getNav()
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      })
    } catch (error) {
      console.error("buildManagementView error:", error)
      req.flash("notice", "Sorry, there was an error processing your request.")
      res.status(500).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      })
    }
  }

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
    try {
      const nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        messages: req.flash(),
      })
    } catch (error) {
      console.error("buildAddClassificationView error:", error)
      req.flash("notice", "Sorry, there was an error processing your request.")
      res.redirect("/inv/")
    }
}

  
/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
    try {
      const nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList()
      res.render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        messages: req.flash(),
      })
    } catch (error) {
      console.error("buildAddInventoryView error:", error)
      req.flash("notice", "Sorry, there was an error processing your request.")
      res.redirect("/inv/")
    }
  }
  

/* ***************************
 *  Process Add Classification
 * ************************** */
invCont.addClassification = async function (req, res) {
    const { classification_name } = req.body
  
    const classResult = await invModel.addClassification(classification_name)
  
    if (classResult) {
      req.flash(
        "notice",
        `The ${classification_name} classification was successfully added.`
      )
      // Rebuild the nav with the new classification
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      })
    } else {
      req.flash("notice", "Sorry, adding the classification failed.")
      let nav = await utilities.getNav()
      res.status(501).render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
        classification_name,
        messages: req.flash(),
      })
    }
  }

/* ***************************
 *  Process Add Inventory
 * ************************** */
invCont.addInventory = async function (req, res) {
    const {
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    } = req.body
  
    const inventoryResult = await invModel.addInventory(
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    )
  
    if (inventoryResult) {
      req.flash(
        "notice",
        `The ${inv_make} ${inv_model} was successfully added.`
      )
      let nav = await utilities.getNav()
      res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      })
    } else {
      req.flash("notice", "Sorry, adding the vehicle failed.")
      let nav = await utilities.getNav()
      const classificationList = await utilities.buildClassificationList(classification_id)
      res.status(501).render("inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        messages: req.flash(),
      })
    }
  }

module.exports = invCont