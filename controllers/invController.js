const invModel = require('../models/inventory-model')

const invController = {}

invController.buildByClassificationId = async function (req, res, next) {
  try {
    const classificationId = Number(req.params.classificationId)
    if (!Number.isInteger(classificationId)) {
      return res.status(400).send('Invalid classification id')
    }

    const { rows } = await invModel.getInventoryByClassificationId(classificationId)

    // titulo amigable (opcional): si quieres el nombre de la clasificación, puedes consultarlo
    const title = 'Vehicles'

    res.render('inventory/classification', {
      title,
      vehicles: rows,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = invController
