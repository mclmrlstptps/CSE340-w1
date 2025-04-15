const { body, validationResult } = require("express-validator")
const utilities = require(".")
const invModel = require("../models/inventory-model")

const validate = {}

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************** */
validate.classificationRules = () => {
  return [
    // classification_name is required and must be string
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .isAlphanumeric()
      .withMessage("Classification name must contain only alphanumeric characters (no spaces or special characters).")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name)
        if (classificationExists) {
          throw new Error("Classification name already exists. Please use a different name.")
        }
      }),
  ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add New Classification",
      nav,
      classification_name,
      messages: req.flash(),
    })
    return
  }
  next()
}

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************** */
validate.inventoryRules = () => {
  return [
    // classification_id is required
    body("classification_id")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please select a classification."),

    // inv_make is required and must be string between 3 and 50 characters
    body("inv_make")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Make must be between 3 and 50 characters."),

    // inv_model is required and must be string between 3 and 50 characters
    body("inv_model")
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Model must be between 3 and 50 characters."),

    // inv_description is required
    body("inv_description")
      .trim()
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters."),

    // inv_image path is required
    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Image path is required."),

    // inv_thumbnail path is required
    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Thumbnail path is required."),

    // inv_price is required and must be a decimal
    body("inv_price")
      .trim()
      .isDecimal({ decimal_digits: "1,2" })
      .withMessage("Price must be a valid number with up to 2 decimal places.")
      .isLength({ min: 1 })
      .withMessage("Price is required."),

    // inv_year is required and must be a 4-digit year
    body("inv_year")
      .trim()
      .isNumeric()
      .withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a 4-digit number.")
      .custom(year => {
        if (year < 1900 || year > 2099) {
          throw new Error("Year must be between 1900 and 2099.");
        }
        return true;
      }),

    // inv_miles is required and must be numeric
    body("inv_miles")
      .trim()
      .isNumeric()
      .withMessage("Miles must be a number.")
      .isLength({ min: 1 })
      .withMessage("Miles are required."),

    // inv_color is required and must be string between 3 and 20 characters
    body("inv_color")
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage("Color must be between 3 and 20 characters."),
  ]
}

/* ******************************
 * Check inventory data and return errors or continue
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
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

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/add-inventory", {
      errors,
      title: "Add New Vehicle",
      nav,
      classificationList,
      classification_id,
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
    return
  }
  next()
}

/* ******************************
   * Check edit and redirect to edit view
   * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    classification_id,
    inv_id,
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

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit ",
      nav,
      classificationList,
      classification_id,
      inv_id,
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
    return
  }
  next()
}

module.exports = validate