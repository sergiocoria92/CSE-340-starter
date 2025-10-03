// utilities/index.js
const invModel = require('../models/inventory-model')
const { checkLogin } = require('./auth') // 👈 usa el guard central

/** Nav superior */
async function getNav () {
  const data = await invModel.getClassifications()
  const items = data.rows || data // por si el driver devuelve rows directo
  let list = '<ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'
  items.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}"
      title="See our inventory of ${row.classification_name} vehicles">
      ${row.classification_name}</a></li>`
  })
  list += '</ul>'
  return list
}

/** Grid por clasificación */
async function buildClassificationGrid (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  let grid = '<ul id="inv-display">'
  data.forEach((v) => {
    const thumb = v.inv_thumbnail || '/images/vehicles/no-image-tn.png'
    grid += `<li>
      <a href="../../inv/detail/${v.inv_id}" title="View ${v.inv_make} ${v.inv_model} details">
        <img src="${thumb}" alt="Image of ${v.inv_make} ${v.inv_model} on CSE Motors" />
      </a>
      <div class="namePrice">
        <hr />
        <h2>
          <a href="../../inv/detail/${v.inv_id}" title="View ${v.inv_make} ${v.inv_model} details">
            ${v.inv_make} ${v.inv_model}
          </a>
        </h2>
        <span>$${new Intl.NumberFormat('en-US').format(v.inv_price)}</span>
      </div>
    </li>`
  })
  grid += '</ul>'
  return grid
}

/** Detail de vehículo */
function buildVehicleDetail (v) {
  if (!v) return '<p class="notice">Vehicle not found.</p>'
  const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  const fmtNum = new Intl.NumberFormat('en-US')
  return `
    <article class="vehicle-detail">
      <div class="vehicle-media">
        <img src="${v.inv_image}" alt="Image of ${v.inv_make} ${v.inv_model}" />
      </div>
      <div class="vehicle-info">
        <h2>${v.inv_year} ${v.inv_make} ${v.inv_model}</h2>
        <p class="price">${fmtUSD.format(Number(v.inv_price || 0))}</p>
        <ul class="meta">
          <li><strong>Mileage:</strong> ${fmtNum.format(Number(v.inv_miles || 0))}</li>
          <li><strong>Color:</strong> ${v.inv_color || '—'}</li>
          <li><strong>Class:</strong> ${v.classification_name}</li>
        </ul>
        <p class="desc">${v.inv_description || ''}</p>
      </div>
    </article>`
}

/** Wrapper de errores async */
const handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/** <select> de clasificaciones (para Add Vehicle y Management/AJAX) */
async function buildClassificationList (selectedId = null) {
  const data = await invModel.getClassifications()
  const items = data.rows || data
  let html = '<select name="classification_id" id="classificationList" required>'
  html += "<option value=''>Select a classification</option>"
  items.forEach((row) => {
    const sel = Number(selectedId) === Number(row.classification_id) ? ' selected' : ''
    html += `<option value="${row.classification_id}"${sel}>${row.classification_name}</option>`
  })
  html += '</select>'
  return html
}

module.exports = {
  getNav,
  buildClassificationGrid,
  buildVehicleDetail,
  handleErrors,
  buildClassificationList,
  // 👇 exporta el guard central (JWT) para quien lo necesite
  checkLogin,
}
