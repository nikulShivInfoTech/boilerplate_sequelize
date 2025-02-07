const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { database } = require('./app/helper/db');
const router = require('./app/router/route');
const logger = require('./app/helper/logger');
require('dotenv').config();
const path =require('path')

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

database();

const port = process.env.PORT;

app.listen(port, () => {
  logger.info(`Your app is running on server: ${port}`);
});
