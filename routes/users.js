var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

login: (req, res) => {
  const { user } = req

  res.render('dashboard')
}

module.exports = router;
