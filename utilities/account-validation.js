// utilities/account-validation.js
const { body, validationResult } = require("express-validator")

function registrationRules() {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("First name is required."),
    body("account_lastname").trim().isLength({ min: 1 }).withMessage("Last name is required."),
    body("account_email").trim().isEmail().withMessage("A valid email is required."),
    body("account_password")
      .isStrongPassword({
        minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1
      })
      .withMessage("Password does not meet requirements.")
  ]
}

async function checkRegistrationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require("../utilities")
    const nav = await utilities.getNav()
    return res.status(400).render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email
    })
  }
  next()
}

/* ===== Login ===== */
function loginRules() {
  return [
    body("account_email").trim().isEmail().withMessage("Enter a valid email."),
    body("account_password").trim().isLength({ min: 12 }).withMessage("Enter your password.")
  ]
}

async function checkLoginData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const utilities = require("../utilities")
    const nav = await utilities.getNav()
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email: req.body.account_email
    })
  }
  next()
}

module.exports = { registrationRules, checkRegistrationData, loginRules, checkLoginData }
