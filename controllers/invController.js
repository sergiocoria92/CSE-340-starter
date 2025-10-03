// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

/* =============================
 *  Public views
 * ============================= */

/** GET /inv/type/:classificationId */
async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = parseInt(req.params.classificationId, 10)
    const rows = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(rows)
    const className = rows[0]?.classification_name || "Vehicles"
    return res.render("inventory/classification", { title: `${className} vehicles`, grid })
  } catch (err) { next(err) }
}

/** GET /inv/detail/:invId */
async function buildByInventoryId(req, res, next) {
  try {
    const invId = parseInt(req.params.invId, 10)
    const vehicle = await invModel.getVehicleById(invId)
    const detail = utilities.buildVehicleDetail(vehicle)
    const title = vehicle ? `${vehicle.inv_make} ${vehicle.inv_model}` : "Vehicle"
    return res.render("inventory/detail", { title, detail })
  } catch (err) { next(err) }
}

/* =============================
 *  Management views (protected)
 * ============================= */

/** GET /inv  (Inventory Management) */
async function buildManagement(req, res, next) {
  try {
    const classificationSelect = await utilities.buildClassificationList()
    return res.render("inventory/management", {
      title: "Inventory Management",
      classificationSelect,
      errors: null,
      message: req.flash("notice")
    })
  } catch (err) { next(err) }
}

/** GET /inv/add-classification */
async function buildAddClassification(req, res) {
  return res.render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    message: req.flash("notice"),
    classification_name: ""
  })
}

/** POST /inv/add-classification */
async function addClassification(req, res) {
  const { classification_name } = req.body
  try {
    const ok = await invModel.addClassification(classification_name)
    if (ok) {
      req.flash("notice", "Classification added.")
      return res.redirect(303, "/inv")
    }
    req.flash("notice", "Sorry, the classification could not be added.")
  } catch (e) {
    if (e && e.code === "23505") {
      req.flash("notice", "Classification already exists.")
    } else {
      console.error(e)
      req.flash("notice", "Unexpected error.")
    }
  }
  return res.status(500).render("inventory/add-classification", {
    title: "Add Classification",
    errors: null,
    message: req.flash("notice"),
    classification_name
  })
}

/** GET /inv/add-vehicle */
async function buildAddInventory(req, res) {
  const classificationList = await utilities.buildClassificationList()
  return res.render("inventory/add-vehicle", {
    title: "Add Vehicle",
    classificationList,
    errors: null,
    message: req.flash("notice"),
    data: {}
  })
}

/** POST /inv/add-vehicle */
async function addInventory(req, res) {
  const currentYear = new Date().getFullYear() + 1
  const invData = {
    ...req.body,
    inv_make: (req.body.inv_make || "").trim(),
    inv_model: (req.body.inv_model || "").trim(),
    inv_year: Math.max(1900, Math.min(currentYear, parseInt(req.body.inv_year, 10) || 0)),
    inv_description: (req.body.inv_description || "").trim(),
    inv_image: (req.body.inv_image || "").trim(),
    inv_thumbnail: (req.body.inv_thumbnail || "").trim(),
    inv_price: parseFloat(req.body.inv_price),
    inv_miles: req.body.inv_miles ? parseInt(req.body.inv_miles, 10) : null,
    inv_color: (req.body.inv_color || "").trim(),
    classification_id: parseInt(req.body.classification_id, 10),
    inv_stock: req.body.inv_stock ? parseInt(req.body.inv_stock, 10) : null
  }

  try {
    const ok = await invModel.addVehicle(invData)
    if (ok) {
      req.flash("notice", "Vehicle added.")
      return res.redirect(303, "/inv")
    }
    req.flash("notice", "Vehicle insert failed.")
  } catch (e) {
    console.error(e)
    req.flash("notice", "Unexpected error.")
  }
  const classificationList = await utilities.buildClassificationList(invData.classification_id)
  return res.status(500).render("inventory/add-vehicle", {
    title: "Add Vehicle",
    classificationList,
    errors: null,
    message: req.flash("notice"),
    data: invData
  })
}

/* =============================
 *  AJAX JSON endpoint (management table)
 * ============================= */

/** GET /inv/getInventory/:classification_id  -> JSON */
async function getInventoryJSON(req, res, next) {
  try {
    const id = Number(req.params.classification_id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid classification id" })
    }
    const invData = await invModel.getInventoryByClassificationId(id)
    return res.json(invData || [])
  } catch (err) { next(err) }
}

/* =============================
 *  Update (Step 1 & Step 2)
 * ============================= */

/** GET /inv/edit/:inv_id  (Step 1) */
async function buildEditInventory(req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10)
    const itemData = await invModel.getVehicleById(inv_id)
    if (!itemData) return next(new Error("Vehicle not found"))

    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`

    return res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
      // sticky / edición
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    })
  } catch (err) { next(err) }
}

/** POST /inv/update  (Step 2) */
async function updateInventory(req, res, next) {
  try {
    // normaliza valores
    const inv_id = Number(req.body.inv_id)
    const inv_make = (req.body.inv_make || "").trim()
    const inv_model = (req.body.inv_model || "").trim()
    const inv_description = (req.body.inv_description || "").trim()
    const inv_image = (req.body.inv_image || "").trim()
    const inv_thumbnail = (req.body.inv_thumbnail || "").trim()
    const inv_price = Number(req.body.inv_price)
    const inv_year = Number(req.body.inv_year)
    const inv_miles = req.body.inv_miles ? Number(req.body.inv_miles) : null
    const inv_color = (req.body.inv_color || "").trim()
    const classification_id = Number(req.body.classification_id)

    const updated = await invModel.updateInventory(
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
    )

    if (updated) {
      const itemName = `${(updated.inv_make || inv_make)} ${(updated.inv_model || inv_model)}`
      req.flash("notice", `The ${itemName} was successfully updated.`)
      return res.redirect("/inv/")
    }

    // si falla, volver a pintar la vista de edición
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + `${inv_make} ${inv_model}`,
      classificationSelect,
      errors: null,
      message: req.flash("notice"),
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
  } catch (err) { next(err) }
}

module.exports = {
  buildByClassificationId,
  buildByInventoryId,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  getInventoryJSON,
  buildEditInventory,
  updateInventory
}
