// routes/inventoryRoute.js
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

// Inventario por clasificación
router.get("/type/:classificationId", invController.buildByClassificationId)

// Detalle por id
router.get("/detail/:invId", invController.buildByInventoryId)

// Ruta para provocar un 500 (intencional, para prueba)
router.get("/cause-error", (_req, _res, next) => {
  next(new Error("Intentional server error"))
})

module.exports = router
