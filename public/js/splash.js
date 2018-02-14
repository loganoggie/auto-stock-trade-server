function activateLoginForm() {
  var loginForm = document.getElementsByClassName('login-form-container');
  var registerForm = document.getElementsByClassName('register-form-container');
  registerForm[0].style.display = 'none';
  loginForm[0].style.display = 'block';
}


function activateRegisterForm() {
  var loginForm = document.getElementsByClassName('login-form-container');
  var registerForm = document.getElementsByClassName('register-form-container');
  registerForm[0].style.display = 'block';
  loginForm[0].style.display = 'none';
}
