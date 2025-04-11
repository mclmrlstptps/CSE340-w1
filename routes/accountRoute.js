const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const validate = require('../utilities/account-validation')

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Registration view
router.get("/registration", utilities.handleErrors(accountController.buildRegistration))

// Account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.accountManagement))

// Process the registration data
router.post(
  "/registration",
  validate.registationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// // Account update view
// router.get("/update/:account_id", 
//   utilities.checkLogin, 
//   utilities.handleErrors(accountController.buildAccountUpdate)
// )
router.get("/update/:account_id", (req, res, next) => {
  console.log("Route handler called for: /update/" + req.params.account_id);
  next();
}, utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Process account update
router.post(
  "/update", 
  utilities.checkLogin,
  validate.accountUpdateRules(),
  validate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount)
)

// Process password update
router.post(
  "/update-password", 
  utilities.checkLogin,
  validate.passwordRules(),
  validate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout route
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))

module.exports = router