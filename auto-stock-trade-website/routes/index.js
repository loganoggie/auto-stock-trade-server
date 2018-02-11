var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('splash');
});

router.post('/login', function(req, res, next) {
  // This wont actually need to render anything in the future
  // This is really just to make sure it worked.
  res.render('login');
});

router.post('/register', function(req, res) {
  // These wont actually need to render anything in the future
  // This is really just to make sure it worked.
  res.render('register');
});

module.exports = router;
