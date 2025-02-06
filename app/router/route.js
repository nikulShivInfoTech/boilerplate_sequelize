const express = require('express')
const router = express.Router()
const user = require('./routers/userRoute');
router.use('/User', user);
module.exports = router;


