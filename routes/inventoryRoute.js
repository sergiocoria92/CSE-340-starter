// routes/inventoryRoute.js
const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')
const invValidate = require('../utilities/inventory-validation')

// Inventario por clasificación
router.get('/type/:classificationId', invController.buildByClassificationId)

// Detalle por id
router.get('/detail/:invId', invController.buildByInventoryId)

// Vista de administración
router.get('/', invController.buildManagement)

// Agregar clasificación
router.get('/add-classification', invController.buildAddClassification)
router.post(
  '/add-classification',
  invValidate.classRules(),
  invValidate.checkClassData,
  invController.addClassification
)

// Agregar vehículo
router.get('/add-vehicle', invController.buildAddInventory)
router.post(
  '/add-vehicle',
  invValidate.vehicleRules(),
  invValidate.checkVehicleData,
  invController.addInventory
)

module.exports = router
