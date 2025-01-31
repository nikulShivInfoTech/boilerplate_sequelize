const express = require('express');
const { auth } = require('../../middleware/auth.js');
const route = express.Router();

const {
  addUser,
  viewUser,
  listUser,
  editUser,
  login,
  resetPassword,
  otpSend,
  forgotPassword,
} = require('../../controller/usercontroller.js');
route.post('/registration', addUser);
route.get('/profile', auth(), viewUser);
route.put('/edit', auth(), editUser);
route.put('/resetPassword', auth(), resetPassword);
route.post('/listofUsers', auth(), listUser);
route.post('/login', login);
route.post('/resetPassword/otp', otpSend);
route.post('/forgotPassword', forgotPassword);

module.exports = route;
