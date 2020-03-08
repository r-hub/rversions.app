var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.send({ info: "https://github.com/r-hub/rversions.app" });
});

module.exports = router;
