// routes/inventoryRoute.js
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")
const { checkLogin, requireRole } = require("../utilities/auth")

// Público
router.get("/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)
router.get("/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
)

// Administración (protegido + rol)
router.get("/",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  utilities.handleErrors(invController.buildManagement)
)

router.get("/add-classification",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  utilities.handleErrors(invController.buildAddClassification)
)
router.post("/add-classification",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  invValidate.classRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

router.get("/add-vehicle",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  utilities.handleErrors(invController.buildAddInventory)
)
router.post("/add-vehicle",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addInventory)
)

// AJAX (tabla en Management)
router.get("/getInventory/:classification_id",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  utilities.handleErrors(invController.getInventoryJSON)
)

// UPDATE vehículo (si ya lo agregaste en W04)
router.get("/edit/:inv_id",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  utilities.handleErrors(invController.buildEditInventory)
)
router.post("/update",
  checkLogin,
  requireRole(["Employee", "Admin"]),
  invValidate.vehicleRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router
