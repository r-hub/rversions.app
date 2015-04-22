var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.end('{ "info": "https://github.com/metacran/rversions.app" }');
});

router.get('/r-release', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-release.json")
});

router.get('/r-oldrel', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-oldrel.json")
});

router.get('/r-versions', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-versions.json")
});

module.exports = router;
