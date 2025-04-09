const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}

// 
/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegistration(req, res, next) {

  let nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    errors: null,
    messages: req.flash()
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password
  let hashedPassword
  try {
    // bcrypt.hashSync is synchronous, don't use await with it
    hashedPassword = bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/registration", {
      title: "Registration",
      nav,
      errors: null,
      messages: req.flash()
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
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

}

/* ****************************************
 *  Process login request
 * ************************************ */
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
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function buildAccount (req, res) {
  try {
    res.render("./account/account-management", {
      title: "Account Management",
      nav: await utilities.getNav(),
      messages: req.flash("notice"),
      errors: req.flash("error")
    });
  } catch (error) {
    req.flash("error", "An error occurred");
    res.render("./account/account-management", {
      title: "Account Management",
      nav: await utilities.getNav(),
      message: null,
      errors: [req.flash("error")]
    });
  }
}

async function buildManagement(req, res) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
  })
}


async function accountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();

    if(!res.locals.loggedin) {
      req.flash("notice", "Please log in to view account information");
      return res.redirect("/account/login");
    }

    req.flash("notice", "You're logged in");
    res.render("account/account-management", {
      title: "Account Information",
      nav,
      accountData: res.locals.accountData,
      errors: null,
    });
  } catch (error) {
    next(error);
  }
}


module.exports = { 
  buildLogin, 
  buildRegistration, 
  registerAccount, 
  accountLogin, 
  accountManagement, 
  buildManagement 
}