const baseController = {}
baseController.buildHome = async function (req, res) {
  res.render('index', { title: 'CSE Motors' })
}
module.exports = baseController

