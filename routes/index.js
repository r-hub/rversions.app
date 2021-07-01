const express = require('express');
const router = express.Router();
const endpoints = require('../lib/endpoints');
const cache = require('../lib/cache');

router.get("/r-oldrel/:n", async (req, res, next) => {
    try {
        const n = req.params.n;
        if (['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].indexOf(n) == -1) {
            res.status(404)
                .send({ error: 'End point not found, see documentation' });
        }
        const value = await cache.get('r-oldrel/' + n);
          if (value === null) {
              res.status(500)
                  .send({ error: 'Internal server error, cannot find /r-oldrel/' + n });
          } else {
              res.type('application/json')
                  .send(value);
          }
    } catch (error) {
        next(error);
    }
});

router.get('/:what', async (req, res, next) => {
  try {
      const what = req.params.what;
      if (endpoints.indexOf(what) == -1) {
          res.status(404)
              .send({ error: 'End point not found, see documentation' });
      } else {
          const value = await cache.get(what);
          if (value === null) {
              res.status(500)
                  .send({ error: 'Internal server error, cannot find ' + what });
          } else {
              res.type('application/json')
                  .send(value);
          }
      }

  } catch (error) {
      next(error);
  }
});

module.exports = router;
