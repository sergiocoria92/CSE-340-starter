// models/inventory-model.js
const db = require("../database")

/** Clasificaciones (para nav y <select>) */
async function getClassifications () {
  const sql = `
    SELECT classification_id, classification_name
    FROM public.classification
    ORDER BY classification_name`
  return db.query(sql)
}

/** Inventario por id de clasificación (grid y JSON AJAX) */
async function getInventoryByClassificationId (classification_id) {
  const sql = `
    SELECT i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail,
           i.classification_id, c.classification_name
    FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
    WHERE i.classification_id = $1
    ORDER BY i.inv_make, i.inv_model, i.inv_year`
  const { rows } = await db.query(sql, [classification_id])
  return rows
}

/** Un vehículo por id (detail) */
async function getVehicleById (inv_id) {
  const sql = `
    SELECT i.*, c.classification_name
    FROM public.inventory i
    JOIN public.classification c
      ON i.classification_id = c.classification_id
    WHERE i.inv_id = $1`
  const { rows } = await db.query(sql, [inv_id])
  return rows[0] || null
}

/** Insertar clasificación */
async function addClassification (classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1) RETURNING classification_id`
  const result = await db.query(sql, [classification_name])
  return result.rowCount === 1
}

/** Insertar vehículo */
async function addVehicle (d) {
  const sql = `
    INSERT INTO public.inventory
    (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
     inv_price, inv_miles, inv_color, classification_id)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING inv_id`
  const vals = [
    d.inv_make,
    d.inv_model,
    d.inv_year,
    d.inv_description,
    d.inv_image,
    d.inv_thumbnail,
    d.inv_price,
    d.inv_miles || null,
    d.inv_color,
    d.classification_id
  ]
  const result = await db.query(sql, vals)
  return result.rowCount === 1
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  const sql = `
    UPDATE public.inventory
       SET inv_make = $1,
           inv_model = $2,
           inv_description = $3,
           inv_image = $4,
           inv_thumbnail = $5,
           inv_price = $6,
           inv_year = $7,
           inv_miles = $8,
           inv_color = $9,
           classification_id = $10
     WHERE inv_id = $11
     RETURNING *`
  const vals = [
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles || null,
    inv_color,
    classification_id,
    inv_id
  ]
  const { rows } = await db.query(sql, vals)
  return rows[0] || null
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addVehicle,
  updateInventory
}
