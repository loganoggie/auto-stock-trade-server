// Just making sure this module runs
console.log('passport.js initiated');

// Global Module Handling ---------------------------------------------
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//---------------------------------------------------------------------
// Local Module Handling ----------------------------------------------
var {client} = require('./database.js');
//---------------------------------------------------------------------



passport.use('local-login', new LocalStrategy({session: true}, function(email, password, cb) {
  client.query("SELECT id, email, password FROM users WHERE email = $1", [email], (err, result) => {
    if(err) {
      console.log('Error when selecting user on login', err)
      return cb(err)
    }

    console.log('Did we get a result?');
    if(result.rows.length > 0) {
      const first = result.rows[0];
      console.log("-------------------- Checking 1")
      if(bcrypt.compareSync(password, first.password)) {
        cb(null, first);
      } else {
        console.log('Passwords didnt match.');
        cb(null, false);
      }
      console.log("------------------------ Checking 2")
    } else {
      console.log('Logging in was unsuccessful.');
      cb(null, false);
    }
  });
  console.log("-----------------------End of passport function");
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, cb) => {
  client.query('SELECT id, email FROM users WHERE id = $1', [parseInt(id, 10)], (err, results) => {

    if(err) {
      console.log('Error when selecting user on session deserialize', err);
      return cb(err);
    }

    cb(null, results.rows[0]);
  })
});

module.exports.passport = passport;
module.exports.LocalStrategy = LocalStrategy;
