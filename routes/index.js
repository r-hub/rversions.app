
var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.end('{ "info": "https://github.com/metacran/rversions.app" }');
});

router.get('/r-release', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-release.json", { root: path.join(__dirname, "..") })
});

router.get('/r-oldrel', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-oldrel.json", { root: path.join(__dirname, "..") })
});

router.get('/r-versions', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-versions.json", { root: path.join(__dirname, "..") })
});

router.get('/r-release-tarball', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-release-tarball.json",
		 { root: path.join(__dirname, "..") })
});

router.get('/r-release-win', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-release-win.json",
		 { root: path.join(__dirname, "..") })
});

router.get('/r-release-macos', function(req, res) {
    res.set('Content-Type', 'application/json');
    res.set(200)
    res.sendFile("./r-release-macos.json",
		 { root: path.join(__dirname, "..") })
});

module.exports = router;
