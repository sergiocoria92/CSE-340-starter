// controllers/invController.js
const invModel = require('../models/inventory-model')
const utilities = require('../utilities')

/** /inv/type/:classificationId */
async function buildByClassificationId (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const rows = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(rows)
    const className = rows[0]?.classification_name || 'Vehicles'
    res.render('inventory/classification', { title: `${className} vehicles`, grid })
  } catch (err) {
    next(err)
  }
}

/** /inv/detail/:invId */
async function buildByInventoryId (req, res, next) {
  try {
    const invId = req.params.invId
    const vehicle = await invModel.getVehicleById(invId)
    const detail = utilities.buildVehicleDetail(vehicle)
    const title = vehicle ? `${vehicle.inv_make} ${vehicle.inv_model}` : 'Vehicle'
    res.render('inventory/detail', { title, detail })
  } catch (err) {
    next(err)
  }
}

/** /inv  (Vehicle Management) */
async function buildManagement (req, res) {
  res.render('inventory/management', {
    title: 'Vehicle Management',
    message: req.flash('notice')
  })
}

/** GET /inv/add-classification */
async function buildAddClassification (req, res) {
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    errors: null,
    message: req.flash('notice'),
    classification_name: ''
  })
}

/** POST /inv/add-classification */
async function addClassification (req, res) {
  const { classification_name } = req.body
  try {
    const ok = await invModel.addClassification(classification_name)
    if (ok) {
      req.flash('notice', 'Classification added.')
      return res.redirect(303, '/inv')
    }
    req.flash('notice', 'Sorry, the classification could not be added.')
  } catch (e) {
    if (e && e.code === '23505') {
      req.flash('notice', 'Classification already exists.')
    } else {
      console.error(e)
      req.flash('notice', 'Unexpected error.')
    }
  }
  res.status(500).render('inventory/add-classification', {
    title: 'Add Classification',
    errors: null,
    message: req.flash('notice'),
    classification_name
  })
}

/** GET /inv/add-vehicle */
async function buildAddInventory (req, res) {
  const classificationList = await utilities.buildClassificationList()
  res.render('inventory/add-vehicle', {
    title: 'Add Vehicle',
    classificationList,
    errors: null,
    message: req.flash('notice'),
    data: {}
  })
}

/** POST /inv/add-vehicle */
async function addInventory (req, res) {
  const currentYear = new Date().getFullYear() + 1
  const invData = {
    ...req.body,
    inv_make: (req.body.inv_make || '').trim(),
    inv_model: (req.body.inv_model || '').trim(),
    inv_year: Math.max(1900, Math.min(currentYear, parseInt(req.body.inv_year, 10) || 0)),
    inv_description: (req.body.inv_description || '').trim(),
    inv_image: (req.body.inv_image || '').trim(),
    inv_thumbnail: (req.body.inv_thumbnail || '').trim(),
    inv_price: parseFloat(req.body.inv_price),
    inv_miles: req.body.inv_miles ? parseInt(req.body.inv_miles, 10) : null,
    inv_color: (req.body.inv_color || '').trim(),
    classification_id: parseInt(req.body.classification_id, 10),
    inv_stock: parseInt(req.body.inv_stock, 10) // no está en DB pero lo validamos si tu esquema lo tuviera
  }

  try {
    const ok = await invModel.addVehicle(invData)
    if (ok) {
      req.flash('notice', 'Vehicle added.')
      return res.redirect(303, '/inv')
    }
    req.flash('notice', 'Vehicle insert failed.')
  } catch (e) {
    console.error(e)
    req.flash('notice', 'Unexpected error.')
  }
  const classificationList = await utilities.buildClassificationList(invData.classification_id)
  res.status(500).render('inventory/add-vehicle', {
    title: 'Add Vehicle',
    classificationList,
    errors: null,
    message: req.flash('notice'),
    data: invData // sticky
  })
}

module.exports = {
  buildByClassificationId,
  buildByInventoryId,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory
}
