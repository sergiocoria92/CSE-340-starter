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

// ====== AJAX (tabla en Management) ======
router.get(
  '/getInventory/:classification_id',
  checkLogin, // opcional
  utilities.handleErrors(invController.getInventoryJSON)
)

// ====== UPDATE (Step 1: mostrar formulario poblado) ======
router.get(
  '/edit/:inv_id',
  checkLogin,
  // requireRole(['Admin','Employee']),
  utilities.handleErrors(invController.buildEditInventory)
)

// ====== UPDATE (Step 2: procesar cambios) ======
router.post(
  '/update',
  checkLogin,
  // requireRole(['Admin','Employee']),
  invValidate.vehicleRules(),      // mismas reglas que "add"
  invValidate.checkUpdateData,     // pero re-renderiza la vista de edición
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router
