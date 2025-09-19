// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId
    const rows = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(rows)
    const nav = await utilities.getNav()
    const className = rows[0]?.classification_name || "Vehicles"

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    })
  } catch (err) {
    next(err)
  }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const invId = req.params.invId
    const vehicle = await invModel.getVehicleById(invId)
    const detail = utilities.buildVehicleDetail(vehicle)
    const nav = await utilities.getNav()
    const title = vehicle ? `${vehicle.inv_make} ${vehicle.inv_model}` : "Vehicle"

    res.render("./inventory/detail", { title, nav, detail })
  } catch (err) {
    next(err)
  }
}

module.exports = invCont
