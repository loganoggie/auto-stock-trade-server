// Just making sure this module runs
console.log('passport.js initiated');

// Global Module Handling ---------------------------------------------
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//---------------------------------------------------------------------
// Local Module Handling ----------------------------------------------
var {client} = require('./database.js');
//---------------------------------------------------------------------

passport.use(new LocalStrategy({session: true}, function(email, password, cb) {
  client.query("SELECT id, email, password FROM users WHERE email = $1 AND password = $2", [email, password], (err, result) => {
    if(err) {
      console.log('Error when selecting user on login', err)
      return cb(err)
    }

    if(result.rows.length > 0) {
      const first = result.rows[0];
      cb(null, first);
    } else {
      console.log('Logging in was unsuccessful.');
      cb(null, false);
    }
  });
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
