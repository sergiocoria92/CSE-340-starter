// utilities/account-validation.js
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const utilities = require("../utilities")

/* ===== Registro ===== */
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

/* ===== Update profile ===== */
function updateAccountRules() {
  return [
    body("account_firstname").trim().notEmpty().withMessage("First name is required."),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
    body("account_email")
      .trim().isEmail().withMessage("A valid email is required.")
      .custom(async (email, { req }) => {
        const id = Number(req.body.account_id)
        const existing = await accountModel.getAccountByEmail(email)
        if (existing && Number(existing.account_id) !== id) {
          throw new Error("Email already in use.")
        }
        return true
      }),
    body("account_id").toInt().isInt().withMessage("Invalid account id.")
  ]
}

async function checkUpdateAccountData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: req.flash("notice"),
      account_id: req.body.account_id,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
    })
  }
  next()
}

/* ===== Change password ===== */
function passwordChangeRules() {
  return [
    body("account_password")
      .isStrongPassword({
        minLength: 12, minUppercase: 1, minNumbers: 1, minSymbols: 1
      })
      .withMessage("Password does not meet requirements."),
    body("account_id").toInt().isInt().withMessage("Invalid account id.")
  ]
}

async function checkPasswordChange(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const me = await accountModel.getAccountById(req.body.account_id)
    return res.status(400).render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      message: req.flash("notice"),
      account_id: me.account_id,
      account_firstname: me.account_firstname,
      account_lastname: me.account_lastname,
      account_email: me.account_email,
    })
  }
  next()
}

module.exports = {
  registrationRules,
  checkRegistrationData,
  loginRules,
  checkLoginData,
  updateAccountRules,
  checkUpdateAccountData,
  passwordChangeRules,
  checkPasswordChange,
}
