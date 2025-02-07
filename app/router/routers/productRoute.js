const express = require('express');
const upload = require('../../middleware/multer')
const route = express.Router();
const { auth } = require('../../middleware/auth');
const { productAdd,getProductById,productList,addProductImage,productUpdate,productDelete } = require('../../controller/productController')

route.post('/add', auth(),upload.any(), productAdd)
route.post('/list', auth(), productList)
route.put('/update/:id', auth(), productUpdate)
route.delete('/delete/:id', auth(), productDelete)
route.get('/view/:id', auth(), getProductById)
route.post('/addImage/:id', auth(),upload.any(), addProductImage)

module.exports = route;