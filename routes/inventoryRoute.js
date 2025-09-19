const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController')

// /inv/type/ID -> lista autos de esa clasificación
router.get('/type/:classificationId', invController.buildByClassificationId)

module.exports = router
