/*

NOTE -- This file is full of things that we don't
currently use, but could be useful in the future
if changes are made.

*/

//
// router.post('/login', function(req, res, next) {
//
//
//   var username = (req['body']['username']);
//   var password = (req['body']['password']);
//
//   client.query("SELECT email,password FROM users WHERE email='"+username+"' AND password='"+password+"';", (err,res2) => {
//     if(err) throw err;
//
//     if(res2.rows.length>0)
//     {
//       console.log("Logged in");
//       res.render('dashboard'); //pass the user in optional parameters
//     }
//     else
//     {
//       console.log("Wrong email/password");
//       res.render('splash'); //redirect back to splash
//     }
//   });
// });
