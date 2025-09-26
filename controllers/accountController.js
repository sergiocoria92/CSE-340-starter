// controllers/accountController.js
const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")

const accountController = {}

/* GET /account/login */
accountController.buildLogin = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    return res.render("account/login", { title: "Login", nav })
  } catch (err) {
    return next(err)
  }
}

/* POST /account/login (demo) */
accountController.loginProcess = async (req, res) => {
  const { account_email, account_password } = req.body
  if (!account_email || !account_password) {
    req.flash("error", "Email and password are required.")
    return res.redirect("/account/login")
  }

  // TODO: Reemplazar por autenticación real con bcrypt.compare(...)
  req.session.loggedin = true
  req.session.accountData = {
    account_id: 1,
    account_firstname: "Sergio",
    account_email,
  }
  req.flash("notice", "You are now logged in.")
  return res.redirect("/account/")
}

/* GET /account/ */
accountController.accountIndex = (req, res) => {
  const fname = req.session.accountData?.account_firstname || "Guest"
  return res.render("account/index", { title: "My Account", fname })
}

/* GET /account/logout */
accountController.logout = (req, res) => {
  // regenerate limpia la sesión y permite usar flash después
  req.session.regenerate((err) => {
    if (err) {
      req.flash("error", "Logout failed. Please try again.")
      return res.redirect("/account/")
    }
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  })
}

/* GET /account/register */
// controllers/accountController.js
// controllers/accountController.js
accountController.buildRegister = async (req, res, next) => {
  try {
    const nav = await utilities.getNav()
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,          // <- requerido por la actividad
      account_firstname: "",
      account_lastname: "",
      account_email: "",
    })
  } catch (err) {
    return next(err)
  }
}



/* POST /account/register */
accountController.registerProcess = async (req, res) => {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body

  try {
    // Hash del password
    const passwordHash = await bcrypt.hash(account_password, 10)

    // Crear cuenta
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

    // Email duplicado (violación UNIQUE en Postgres)
    if (err.code === "23505") {
      return res.status(400).render("account/register", {
        title: "Register",
        nav,
        errors: [{ msg: "Email is already registered." }],
        // sticky values:
        account_firstname,
        account_lastname,
        account_email,
      })
    }

    // Error genérico
    req.flash("error", "Registration failed. Please try again.")
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

module.exports = accountController
