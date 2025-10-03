// routes/accountRoute.js
const express = require("express")
const router = express.Router()

const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require("../utilities/account-validation")
const { checkLogin } = require("../utilities/auth") // guard basado en JWT

// Vistas
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Proceso de login (validación -> controlador)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Registro
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegistrationData,
  utilities.handleErrors(accountController.registerProcess)
)

// Panel de cuenta (protegido)
router.get("/", checkLogin, utilities.handleErrors(accountController.accountIndex))

// Logout (protegido)
router.get("/logout", checkLogin, utilities.handleErrors(accountController.logout))

module.exports = router
