const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const accountModel = require("../models/account-model")
const jwt = require('jsonwebtoken')
require('dotenv').config()

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registationRules = () => {
    return [
        // firstname is required and must be string
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a first name."), // on error this message is sent.

        // lastname is required and must be string
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 2 })
            .withMessage("Please provide a last name."), // on error this message is sent.

        // valid email is required and cannot already exist in the database
        body("account_email")
            .trim()
            .isEmail()
            .normalizeEmail() // refer to validator.js docs
            .withMessage("A valid email is required.")
            .custom(async (account_email) => {
                const emailExists = await accountModel.checkExistingEmail(account_email)
                if (emailExists) {
                    throw new Error("Email exists. Please log in or use different email")
                }
            }),
        // password is required and must be strong password
        body("account_password")
            .trim()
            .notEmpty()
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
            .withMessage("Password does not meet requirements."),
    ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/registration", {
            errors,
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* **********************************
 * Login Data Validation Rules
 * ******************************** */
validate.loginRules = () => {
    return [
      // Email is required and must be valid
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
      
      // Password is required
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
    ]
  }
  
  /* ******************************
   * Check login data and return errors or continue
   * ***************************** */
  validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
        errors,
        title: "Login",
        nav,
        account_email,
        messages: req.flash()
      })
      return
    }
    next()
  }

/* ******************************
 * Check if user is Admin or Employee
 * ***************************** */
validate.checkAdminEmployee = (req, res, next) => {
    // Get the JWT token from the cookie
    const token = req.cookies.jwt
    
    // If no token exists, redirect to login with message
    if (!token) {
      const message = "Please log in to access inventory management"
      req.flash("notice", message)
      return res.redirect("/account/login")
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      
      // Check if account type is Employee or Admin
      if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
        // Store the account data in the request for future use
        req.accountData = decoded
        next()
      } else {
        // If not the right account type, redirect with message
        const message = "Access denied. Requires employee or admin privileges."
        req.flash("notice", message)
        return res.redirect("/account/login")
      }
    } catch (error) {
      // Token is invalid
      const message = "Your session has expired. Please log in again."
      req.flash("notice", message)
      return res.redirect("/account/login")
    }
  }

/* ******************************
 * Account update data validation rules
 * ****************************** */
validate.accountUpdateRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."), 

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a last name."), 

    // valid email is required
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail() 
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const emailExists = await accountModel.checkExistingEmail(account_email)
        // If email exists and it belongs to different account than the one being updated
        if (emailExists && emailExists.account_id != account_id){
          throw new Error("Email exists. Please use a different email")
        }
      }),
  ]
}

/* ******************************
 * Check account update data
 * ***************************** */
validate.checkAccountUpdateData = async (req, res, next) => {
  // Add a check to ensure req.body exists
  if (!req.body) {
    console.error("req.body is undefined in checkAccountUpdateData");
    req.flash("notice", "No form data received");
    return res.redirect("/account/");
  }
  
  console.log("req.body in checkAccountUpdateData:", req.body);
  
  const { account_firstname, account_lastname, account_email } = req.body || {};
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      accountData: req.body
    })
    return
  }
  next()
}

/* ******************************
 * Password update validation rules
 * ***************************** */
validate.passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements. Must be at least 12 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.")
  ]
}

/* ******************************
 * Check password data
 * ***************************** */
validate.checkPasswordData = async (req, res, next) => {
  const { account_password } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    // Get account data for the view
    const account_id = req.body.account_id
    const accountData = await accountModel.getAccountById(account_id)
    res.render("account/update", {
      errors,
      title: "Update Account",
      nav,
      accountData,
    })
    return
  }
  next()
}

/* ****************************************
 * Middleware to check token and provide user data
 **************************************** */
const checkLogin = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt, 
      process.env.ACCESS_TOKEN_SECRET, 
      function (err, accountData) {
        if (err) {
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.loggedin = 1
        res.locals.accountData = accountData
        next()
      })
  } else {
    next()
  }
}

/* ****************************************
 * Middleware to check if user is logged in
 **************************************** */
const checkIfLoggedIn = (req, res, next) => {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
  next()
}

/* ****************************************
 * Check if user is Admin or Employee
 **************************************** */
const checkAdminEmployee = (req, res, next) => {
  if (res.locals.loggedin) {
    const accountType = res.locals.accountData.account_type
    if (accountType === "Employee" || accountType === "Admin") {
      next()
    } else {
      req.flash("notice", "Access Denied")
      return res.redirect("/account/")
    }
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = validate