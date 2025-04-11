
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    messages: req.flash(),
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
    messages: req.flash(),
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash(),
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      messages: req.flash(),
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash(),
    })
  }
}

/* ****************************************
*  Process login request
* *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      messages: req.flash(),
    })
    return
  }
  
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 * 24 })
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash(),
      })
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function accountManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash(),
    accountData: res.locals.accountData
  })
}

/* ****************************************
*  Build account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id)
    
    // Check if user is authorized to access this account
    if (account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "Access denied")
      return res.redirect("/account/")
    }
    
    const accountData = await accountModel.getAccountById(account_id)
    let nav = await utilities.getNav()
    
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
      messages: req.flash(),
    })
  } catch (error) {
    console.error("buildAccountUpdate error: " + error)
    req.flash("notice", "Sorry, there was an error processing your request.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  
  // Check if user is authorized to update this account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "Access denied")
    return res.redirect("/account/")
  }
  
  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )
  
  if (updateResult) {
    // Update JWT with new data
    const accountData = await accountModel.getAccountById(account_id)
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 24 })
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 * 24 })
    
    req.flash("notice", "Account updated successfully")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: null,
      accountData: {
        account_id,
        account_firstname,
        account_lastname,
        account_email
      },
      messages: req.flash(),
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res, next) {
  const { account_password, account_id } = req.body
  
  // Check if user is authorized to update this account
  if (parseInt(account_id) !== res.locals.accountData.account_id) {
    req.flash("notice", "Access denied")
    return res.redirect("/account/")
  }
  
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.")
    const accountData = await accountModel.getAccountById(account_id)
    return res.status(500).render("account/update", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: null,
      accountData,
      messages: req.flash(),
    })
  }
  
  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )
  
  if (updateResult) {
    req.flash("notice", "Password updated successfully")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    const accountData = await accountModel.getAccountById(account_id)
    res.status(501).render("account/update", {
      title: "Update Account",
      nav: await utilities.getNav(),
      errors: null,
      accountData,
      messages: req.flash(),
    })
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function logoutAccount(req, res, next) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/account/login")
}

module.exports = { 
  buildLogin, 
  buildRegistration, 
  registerAccount, 
  accountLogin, 
  accountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logoutAccount 
}