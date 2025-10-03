// controllers/accountController.js
const bcrypt = require("bcryptjs")
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const { buildJWT } = require("../utilities/auth")

const ONE_HOUR_MS = Number(process.env.COOKIE_MAX_AGE_MS || 3600000)

const accountController = {
  /* ---------- GET /account/login ---------- */
  async buildLogin(req, res, next) {
    try {
      const nav = await utilities.getNav()
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: ""
      })
    } catch (err) { next(err) }
  },

  /* ---------- POST /account/login ---------- */
  async accountLogin(req, res, next) {
    try {
      const { account_email, account_password } = req.body
      const nav = await utilities.getNav()

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

      // Nunca exponer hashes
      delete account.account_password

      // Firmar JWT y guardar en cookie httpOnly
      const token = buildJWT({
        account_id: account.account_id,
        account_firstname: account.account_firstname,
        account_lastname: account.account_lastname,
        account_email: account.account_email,
        account_type: account.account_type || "Client",
      })

      res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ONE_HOUR_MS,
      })

      return res.redirect("/account")
    } catch (error) { next(error) }
  },

  /* ---------- GET /account/ ---------- */
  async accountIndex(req, res, next) {
    try {
      const nav = await utilities.getNav()
      const data = res.locals.accountData || {}
      const fname = data.account_firstname || (data.account_email ? data.account_email.split("@")[0] : "User")
      return res.render("account/index", { title: "My Account", nav, fname, accountData: data })
    } catch (err) { next(err) }
  },

  /* ---------- GET /account/logout ---------- */
  logout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
  },

  /* ---------- GET /account/register ---------- */
  async buildRegister(req, res, next) {
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
    } catch (err) { next(err) }
  },

  /* ---------- POST /account/register ---------- */
  async registerProcess(req, res, next) {
    try {
      const { account_firstname, account_lastname, account_email, account_password } = req.body
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
      const nav = await utilities.getNav()
      if (err.code === "23505") {
        return res.status(400).render("account/register", {
          title: "Register",
          nav,
          errors: [{ msg: "Email is already registered." }],
          account_firstname: req.body.account_firstname,
          account_lastname: req.body.account_lastname,
          account_email: req.body.account_email
        })
      }
      req.flash("error", "Registration failed. Please try again.")
      return res.status(500).render("account/register", {
        title: "Register",
        nav,
        account_firstname: req.body.account_firstname,
        account_lastname: req.body.account_lastname,
        account_email: req.body.account_email
      })
    }
  },

  /* ---------- GET /account/update/:accountId ---------- */
  async buildUpdateAccount(req, res, next) {
    try {
      const nav = await utilities.getNav()

      const me = res.locals.accountData || {}
      const idParam = Number(req.params.accountId)
      const id = (Number.isInteger(idParam) && idParam > 0) ? idParam : me.account_id

      // Solo puede editar su propia cuenta
      if (!me || !me.account_id || me.account_id !== id) {
        req.flash("notice", "Access Forbidden")
        return res.redirect("/account")
      }

      const acc = await accountModel.getAccountById(id)
      if (!acc) return res.redirect("/account")

      return res.render("account/update", {
        title: "Update Account",
        nav,
        errors: null,
        message: req.flash("notice"),
        account_id: acc.account_id,
        account_firstname: acc.account_firstname,
        account_lastname: acc.account_lastname,
        account_email: acc.account_email
      })
    } catch (e) { next(e) }
  },

  /* ---------- POST /account/update ---------- */
  async updateAccount(req, res, next) {
    try {
      const id = Number(req.body.account_id)
      const ok = await accountModel.updateAccount({
        account_id: id,
        account_firstname: req.body.account_firstname.trim(),
        account_lastname: req.body.account_lastname.trim(),
        account_email: req.body.account_email.trim(),
      })

      // Traer datos frescos
      const updated = await accountModel.getAccountById(id)

      if (ok && updated) {
        // Refrescar JWT porque pudo cambiar nombre/email
        const token = buildJWT({
          account_id: updated.account_id,
          account_firstname: updated.account_firstname,
          account_lastname: updated.account_lastname,
          account_email: updated.account_email,
          account_type: updated.account_type || "Client",
        })
        res.cookie("jwt", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: ONE_HOUR_MS,
        })
        req.flash("notice", "Account updated.")
      } else {
        req.flash("notice", "Update failed.")
      }

      const nav = await utilities.getNav()
      return res.render("account/index", {
        title: "My Account",
        nav,
        fname: updated?.account_firstname || "User",
        accountData: updated || {}
      })
    } catch (e) { next(e) }
  },

  /* ---------- POST /account/update-password ---------- */
  async updatePassword(req, res, next) {
    try {
      const id = Number(req.body.account_id)
      const hash = await bcrypt.hash(req.body.account_password, 10)
      const ok = await accountModel.updatePassword(id, hash)
      const updated = await accountModel.getAccountById(id)

      if (ok) req.flash("notice", "Password changed.")
      else req.flash("notice", "Password change failed.")

      const nav = await utilities.getNav()
      return res.render("account/index", {
        title: "My Account",
        nav,
        fname: updated?.account_firstname || "User",
        accountData: updated || {}
      })
    } catch (e) { next(e) }
  },
}

module.exports = accountController
