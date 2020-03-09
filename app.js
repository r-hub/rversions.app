const express = require('express');
const logger = require('morgan');
const mustache = require('mustache-express');

const rts_index = require('./routes/index');

const app = express();

const cache = require('./lib/cache');

app.use(logger('combined'));
app.use(express.urlencoded({ extended: false }));

app.engine('mustache', mustache()); 
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/', rts_index)

module.exports = app;
