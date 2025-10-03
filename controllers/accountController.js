// controllers/accountController.js
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const { buildJWT } = require("../utilities/auth")

const accountController = {}

/* ---------- GET /account/login ---------- */
accountController.buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    return res.render("account/login", { title: "Login", nav, errors: null, account_email: "" })
  } catch (err) { return next(err) }
}

/* ---------- POST /account/login ---------- */
accountController.accountLogin = async (req, res) => {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  try {
    const account = await accountModel.getAccountByEmail(account_email)
    if (!account) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    const ok = await bcrypt.compare(account_password, account.account_password)
    if (!ok) {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    // No exponer hash
    delete account.account_password

    // JWT (1h por defecto)
    const token = buildJWT({
      account_id: account.account_id,
      account_firstname: account.account_firstname,
      account_lastname: account.account_lastname,
      account_email: account.account_email,
      account_type: account.account_type || "Client",
    })

    // Cookie httpOnly
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: Number(process.env.COOKIE_MAX_AGE_MS || 3600000)
    })

    return res.redirect("/account")
  } catch (error) {
    console.error("accountLogin error:", error)
    throw new Error("Access Forbidden")
  }
}

/* ---------- GET /account/ ---------- */
accountController.accountIndex = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    const data = res.locals.accountData || {}
    const fname = data.account_firstname || (data.account_email ? data.account_email.split("@")[0] : "User")
    return res.render("account/index", { title: "My Account", nav, fname, accountData: data })
  } catch (err) { return next(err) }
}

/* ---------- GET /account/logout ---------- */
accountController.logout = (req, res) => {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

/* ---------- GET /account/register ---------- */
accountController.buildRegister = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname: "",
      account_lastname: "",
      account_email: "",
    })
  } catch (err) { return next(err) }
}

/* ---------- POST /account/register ---------- */
accountController.registerProcess = async (req, res) => {
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const passwordHash = await bcrypt.hash(account_password, 10)
    await accountModel.create({
      firstname: account_firstname,
      lastname: account_lastname,
      email: account_email,
      passwordHash,
    })
    req.flash("notice", "Registration successful. Please log in.")
    return res.redirect("/account/login")
  } catch (err) {
    console.error(err)
    const nav = await utilities.getNav()
    if (err.code === "23505") {
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: "Email is already registered." }],
        account_firstname, account_lastname, account_email
      })
    }
    req.flash("error", "Registration failed. Please try again.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      account_firstname, account_lastname, account_email
    })
  }
}

module.exports = accountController
