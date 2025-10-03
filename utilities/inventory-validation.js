// utilities/inventory-validation.js
const { body, validationResult } = require('express-validator')
const utilities = require('../utilities')

/** Reglas para clasificación */
const classRules = () => [
  body('classification_name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Please provide a classification name (min 3 chars).')
]

/** Render si hay errores al agregar clasificación */
async function checkClassData (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).render('inventory/add-classification', {
      title: 'Add Classification',
      errors: errors.array(),
      message: req.flash('notice'),
      classification_name: req.body.classification_name || ''
    })
  }
  next()
}

/** Reglas para vehículo (add/update) */
const vehicleRules = () => [
  body('inv_make').trim().isLength({ min: 2 }).withMessage('Make required (min 2).'),
  body('inv_model').trim().isLength({ min: 1 }).withMessage('Model required.'),
  body('inv_year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Year invalid.'),
  body('inv_price').isFloat({ gt: 0 }).withMessage('Price must be > 0.'),
  body('inv_miles').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Miles must be >= 0.'),
  body('inv_color').trim().isLength({ min: 1 }).withMessage('Color required.'),
  body('classification_id').isInt({ min: 1 }).withMessage('Select a classification.')
]

/** Render si hay errores al agregar vehículo (Add) */
async function checkVehicleData (req, res, next) {
  const errors = validationResult(req)
  const data = { ...req.body }
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(data.classification_id)
    return res.status(400).render('inventory/add-vehicle', {
      title: 'Add Vehicle',
      classificationList,
      errors: errors.array(),
      message: req.flash('notice'),
      data
    })
  }
  next()
}

/** Render si hay errores al actualizar vehículo (Edit) */
async function checkUpdateData (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    } = req.body
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make || ''} ${inv_model || ''}`.trim() || 'Vehicle'
    return res.status(400).render('inventory/edit-inventory', {
      title: 'Edit ' + itemName,
      classificationSelect,
      errors: errors.array(),
      message: req.flash('notice'),
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
  next()
}

module.exports = {
  classRules,
  checkClassData,
  vehicleRules,
  checkVehicleData,
  checkUpdateData
}
