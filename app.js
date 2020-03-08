var express = require('express');
var logger = require('morgan');
var mustache = require('mustache-express');

var rts_index = require('./routes/index');

var app = express();

app.use(logger('combined'));
app.use(express.urlencoded({ extended: false }));

app.engine('mustache', mustache()); 
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/', rts_index)

module.exports = app;
