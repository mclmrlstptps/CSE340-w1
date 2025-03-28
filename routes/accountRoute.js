const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/", utilities.handleErrors(accountController.buildLogin))

router.get("/login", utilities.handleErrors(accountController.buildLogin))

router.get("/registration", utilities.handleErrors(accountController.buildRegistration))
// Process the registration data
router.post(
    "/registration",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

module.exports = router