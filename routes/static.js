// routes/static.js
const express = require('express')
const path = require('path')
const router = express.Router()

const pub = (...p) => path.join(__dirname, '..', 'public', ...p)

router.use(express.static(pub()))               // / (sirve /public)
router.use('/css',    express.static(pub('css')))
router.use('/images', express.static(pub('images')))
router.use('/js',     express.static(pub('js')))

module.exports = router
