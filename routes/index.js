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

router.get('/r-release-tarball', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-release-tarball.json")
});

router.get('/r-release-win', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-release-win.json")
});

router.get('/r-release-macos', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendfile("./r-release-macos.json")
});

module.exports = router;
