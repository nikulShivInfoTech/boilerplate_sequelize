const express = require('express');
const { auth } = require('../../middleware/auth.js');
const route = express.Router();

const {
  addTestimonial,
  viewTestimonial,
  editTestimonial,
  deleteTestimonial,
  listTestimonial
} = require('../../controller/tetimonialController.js');
route.post('/add', auth(), addTestimonial);
route.post('/list', auth(), listTestimonial);
route.get('/view/:id', auth(), viewTestimonial);
route.put('/edit/:id', auth(), editTestimonial);
route.delete('/delete/:id', auth(), deleteTestimonial);

module.exports = route;
