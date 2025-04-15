/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseControllers")
const inventoryRoute = require("./routes/inventoryRoute.js")
const utilities = require("./utilities")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const flash = require('connect-flash')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const reviewRoute = require("./routes/reviewRoute")


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(utilities.checkJWTToken)

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(flash())
app.use(cookieParser())
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Review Route
app.use("/reviews", reviewRoute)

// Index Route

app.get("/", utilities.handleErrors(baseController.buildHome))

app.use("/inv", inventoryRoute)

app.use("/account", accountRoute)

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Oh no, You broke it...' })
})


/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 10000
// The host is only needed for local development
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})


