import express from 'express';
import logger from 'morgan';
import mustache from 'mustache-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import rts_index from './routes/index.js';

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
app.use('/rversions/', express.static('public'))

app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use('/rversions/', rts_index)

export default app;
