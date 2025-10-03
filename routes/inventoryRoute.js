// routes/inventoryRoute.js
const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')
const invValidate = require('../utilities/inventory-validation')
const utilities = require('../utilities')
const { checkLogin, requireRole } = require('../utilities/auth')

// Público
router.get(
  '/type/:classificationId',
  utilities.handleErrors(invController.buildByClassificationId)
)
router.get(
  '/detail/:invId',
  utilities.handleErrors(invController.buildByInventoryId)
)

// Protegido (puedes activar roles si tu instructor lo pide)
router.get(
  '/',
  checkLogin,
  // requireRole(['Admin', 'Employee']),
  utilities.handleErrors(invController.buildManagement)
)

router.get(
  '/add-classification',
  checkLogin,
  // requireRole(['Admin', 'Employee']),
  utilities.handleErrors(invController.buildAddClassification)
)
router.post(
  '/add-classification',
  checkLogin,
  // requireRole(['Admin', 'Employee']),
  invValidate.classRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

router.get(
  '/add-vehicle',
  checkLogin,
  // requireRole(['Admin', 'Employee']),
  utilities.handleErrors(invController.buildAddInventory)
)
router.post(
  '/add-vehicle',
  checkLogin,
  // requireRole(['Admin', 'Employee']),
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addInventory)
)

module.exports = router
