const { categoryAdd, categoryUpdate,categoryView,categoryDelete,categoryList } = require('../../controller/categoryController');
const express = require('express');
const { auth } = require('../../middleware/auth.js');

const route = express.Router();

route.post('/add', auth(), categoryAdd);
route.put('/edit/:id', auth(), categoryUpdate);
route.post('/view/:id', auth(), categoryView);
route.get('/list', auth(), categoryList);
route.delete('/delete/:id', auth(), categoryDelete);

module.exports = route;
