// utilities/account-validation.js
const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

// Password: >=12, minúscula, MAYÚSCULA, número y símbolo.
const strongPwd = { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }

const registrationRules = () => [
  body("account_firstname")
    .trim().escape()
    .notEmpty().withMessage("First name is required.")
    .isLength({ min: 1 }).withMessage("First name is required."),

  body("account_lastname")
    .trim().escape()
    .notEmpty().withMessage("Last name is required.")
    .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),

  body("account_email")
    .trim().escape()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email.")
    .normalizeEmail()
    .custom(async (email) => {
      // opcional: chequeo de duplicado antes del INSERT
      const exists = await accountModel.findByEmail(email)
      if (exists) throw new Error("Email is already registered.")
      return true
    }),

  body("account_password")
    .trim()
    .notEmpty().withMessage("Password is required.")
    .isStrongPassword(strongPwd)
    .withMessage("Password must be at least 12 characters and include uppercase, lowercase, number, and symbol."),
]

// Si hay errores, re-render con "sticky" (sin password)
const checkRegistrationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) return next()

  const nav = await utilities.getNav()
  return res.status(400).render("account/register", {
    title: "Register",
    nav,
    errors: errors.array(),                 // <- array para EJS
    account_firstname: req.body.account_firstname,
    account_lastname: req.body.account_lastname,
    account_email: req.body.account_email,
  })
}

module.exports = { registrationRules, checkRegistrationData }
