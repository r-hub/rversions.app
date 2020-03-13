const express = require('express');
const router = express.Router();
const endpoints = require('../lib/endpoints');
const cache = require('../lib/cache');

router.get('/:what', async (req, res, next) => {
  try {
      const what = req.params.what;
      if (endpoints.indexOf(what) == -1) {
          res.status(404);
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

      next();
  } catch (error) {
      next(error);
  }
});

module.exports = router;
