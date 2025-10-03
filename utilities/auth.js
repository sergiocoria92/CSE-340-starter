// utilities/auth.js
const jwt = require("jsonwebtoken")

/** Firma un JWT con campos no sensibles */
function buildJWT(account) {
  const payload = {
    account_id: account.account_id,
    account_firstname: account.account_firstname,
    account_lastname: account.account_lastname,
    account_email: account.account_email,
    account_type: account.account_type || "Client",
  }
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "1h",
  })
}

/** Guard básico: requiere que el middleware global haya seteado res.locals.loggedin = true */
function checkLogin(req, res, next) {
  if (res.locals.loggedin === true) return next()
  if (typeof req.flash === "function") req.flash("notice", "Please log in.")
  return res.redirect("/account/login")
}

/** Guard por rol (Admin siempre permite) */
function requireRole(required) {
  const requiredList = Array.isArray(required) ? required : [required]
  return (req, res, next) => {
    const user = res.locals.accountData
    if (res.locals.loggedin && user) {
      if (user.account_type === "Admin" || requiredList.includes(user.account_type)) {
        return next()
      }
    }
    if (typeof req.flash === "function") req.flash("notice", "Insufficient permissions.")
    return res.redirect("/account")
  }
}

module.exports = { buildJWT, checkLogin, requireRole }
