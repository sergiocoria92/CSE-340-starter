// routes/accountRoute.js
const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const { registrationRules, checkRegistrationData } = require("../utilities/account-validation")

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.post("/login", utilities.handleErrors(accountController.loginProcess))

router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post(
  "/register",
  registrationRules(),          // 1) reglas
  checkRegistrationData,        // 2) si hay errores -> re-render
  utilities.handleErrors(accountController.registerProcess) // 3) si OK -> crear cuenta
)

router.get("/", utilities.checkLogin, accountController.accountIndex)
router.get("/logout", utilities.checkLogin, accountController.logout)

module.exports = router

