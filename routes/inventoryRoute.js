// routes/inventoryRoute.js
const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')
const invValidate = require('../utilities/inventory-validation')
const utilities = require('../utilities')
const { checkLogin /* , requireRole */ } = require('../utilities/auth')

// Público
router.get('/type/:classificationId',
  utilities.handleErrors(invController.buildByClassificationId)
)
router.get('/detail/:invId',
  utilities.handleErrors(invController.buildByInventoryId)
)

// Protegido (solo login)
router.get('/',
  checkLogin,
  utilities.handleErrors(invController.buildManagement)
)

router.get('/add-classification',
  checkLogin,
  utilities.handleErrors(invController.buildAddClassification)
)
router.post('/add-classification',
  checkLogin,
  invValidate.classRules(),
  invValidate.checkClassData,
  utilities.handleErrors(invController.addClassification)
)

router.get('/add-vehicle',
  checkLogin,
  utilities.handleErrors(invController.buildAddInventory)
)
router.post('/add-vehicle',
  checkLogin,
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  utilities.handleErrors(invController.addInventory)
)

// AJAX para la tabla
router.get('/getInventory/:classification_id',
  checkLogin,
  utilities.handleErrors(invController.getInventoryJSON)
)

// Editar/Actualizar vehículo
router.get('/edit/:inv_id',
  checkLogin,
  utilities.handleErrors(invController.buildEditInventory)
)
router.post('/update',
  checkLogin,
  invValidate.vehicleRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router
