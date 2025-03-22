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
    res.render("./inventory/classification", {
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

    res.render("./inventory/detail", {
        title: vehicleName,
        nav,
        vehicle: vehicleData
    })
}


module.exports = invCont