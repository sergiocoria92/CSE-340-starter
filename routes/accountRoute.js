// routes/accountRoute.js
const express = require("express")
const router = express.Router()

const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const val = require("../utilities/account-validation")
const { checkLogin } = require("../utilities/auth")

// Vistas
router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Procesos
router.post("/login",
  val.loginRules(),
  val.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post("/register",
  val.registrationRules(),
  val.checkRegistrationData,
  utilities.handleErrors(accountController.registerProcess)
)

// Panel
router.get("/", checkLogin, utilities.handleErrors(accountController.accountIndex))

// Update profile/password
router.get("/update/:accountId",
  checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

router.post("/update",
  checkLogin,
  val.updateAccountRules(),
  val.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

router.post("/update-password",
  checkLogin,
  val.passwordChangeRules(),
  val.checkPasswordChange,
  utilities.handleErrors(accountController.updatePassword)
)

// Logout
router.get("/logout", checkLogin, utilities.handleErrors(accountController.logout))

module.exports = router
