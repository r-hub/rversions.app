const express = require('express');
const logger = require('morgan');
const mustache = require('mustache-express');
const fs = require('fs');

const rts_index = require('./routes/index');

const app = express();

// Logging, can go to file, if requested
if (!!process.env.NODE_RVERSIONS_APP_LOGFILE) {
    app.use(logger('combined', {
        stream: fs.createWriteStream(process.env.NODE_RVERSIONS_APP_LOGFILE)
    }));
} else {
    app.use(logger('combined'));
}

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))

app.engine('mustache', mustache()); 
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/', rts_index)

module.exports = app;
