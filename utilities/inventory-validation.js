// utilities/inventory-validation.js
const { body, validationResult } = require('express-validator')
const utilities = require('./index')

exports.classRules = () => [
  body('classification_name')
    .trim()
    .isLength({ min: 1 })
    .isAlphanumeric().withMessage('Solo letras y números, sin espacios.')
]

exports.checkClassData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).render('inventory/add-classification', {
      title: 'Add Classification',
      errors,
      message: req.flash('notice'),
      classification_name: req.body.classification_name
    })
  }
  next()
}

exports.vehicleRules = () => [
  body('inv_make').trim().isLength({ min: 1 }).escape(),
  body('inv_model').trim().isLength({ min: 1 }).escape(),
  body('inv_year').isInt({ min: 1900, max: 2099 }),
  body('inv_description').trim().isLength({ min: 10 }),
  body('inv_image').trim().isLength({ min: 1 }),
  body('inv_thumbnail').trim().isLength({ min: 1 }),
  body('inv_price').isFloat({ gt: 0 }),
  body('inv_miles').optional({ checkFalsy: true }).isInt({ min: 0 }),
  body('inv_color').trim().isLength({ min: 1 }).escape(),
  body('classification_id').isInt({ min: 1 })
]

exports.checkVehicleData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(400).render('inventory/add-vehicle', {
      title: 'Add Vehicle',
      classificationList,
      errors,
      message: req.flash('notice'),
      data: req.body // sticky
    })
  }
  next()
}
