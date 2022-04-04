
const test = require('ava');

const got = require('got');
const semver = require('semver');
const get_port = require('get-port');
const tempy = require('tempy');
const iso_8601_regex = require('../lib/iso-8601-regex');

process.env.NODE_RVERSIONS_APP_REDIS_MOCK = 'true';
process.env.NODE_RVERSIONS_APP_LOGFILE = tempy.file();
if (!process.env.NODE_RVERSIONS_APP_NOMOCK) {
    process.env.NODE_RVERSIONS_DUMMY = 'true';
}
let port;                       // set async

test.before(async () => {
    try {
        port = await get_port();
        process.env.PORT = port;
        const run = require('../bin/run');
        await run();
    } catch(err) {
        let nerr = new Error('Failed to start test server: ' + err.message);
        nerr.stack = err.stack;
        throw(nerr);
    }
});

test.after('cleanup', t => {
    if (!!process.env.NODE_RVERSIONS_APP_LOGFILE) {
        try {
            const fs = require('fs');
            fs.unlinkSync(process.env.NODE_RVERSIONS_LOGFILE);
        } catch(err) {
            // ignore errors here
        }
    }
});


test('unknown endpoint', async t => {
    const resp = await got(
        'http://localhost:' + port + '/foobar',
        { throwHttpErrors: false }
    );
    t.is(resp.statusCode, 404);
});

test('index page', async t => {
    const ret = await got('http://localhost:' + port);
    t.regex(
        ret.body,
        /Download OpenAPI specification/
    );
});

test('r-release', async t => {
    const ret = await got('http://localhost:' + port + '/r-release');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
});

test('r-oldrel', async t => {
    const pvers = [ got('http://localhost:' + port + '/r-oldrel'),
                    got('http://localhost:' + port + '/r-release') ];
    const vers = await Promise.all(pvers);
    const od = JSON.parse(vers[0].body);
    const nw = JSON.parse(vers[1].body);
    t.true(semver.lt(od.version, nw.version));
    t.regex(od.date, iso_8601_regex);
});

test('r-release-tarball', async t => {
    const ret = await got('http://localhost:' + port + '/r-release-tarball');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-release-win', async t => {
    const ret = await got('http://localhost:' + port + '/r-release-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-release-macos', async t => {
    const ret = await got('http://localhost:' + port + '/r-release-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-release-macos-x86_64', async t => {
    const ret = await got('http://localhost:' + port + '/r-release-macos-x86_64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-release-macos-arm64', async t => {
    const ret = await got('http://localhost:' + port + '/r-release-macos-arm64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*arm64.*\.pkg/);
});

test('r-next', async t => {
    const ret = await got('http://localhost:' + port + '/r-next');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-next-win', async t => {
    const ret = await got('http://localhost:' + port + '/r-next-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-next-macos', async t => {
    const ret = await got('http://localhost:' + port + '/r-next-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-next-macos-x86_64', async t => {
    const ret = await got('http://localhost:' + port + '/r-next-macos-x86_64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-next-macos-arm64', async t => {
    const ret = await got('http://localhost:' + port + '/r-next-macos-arm64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*arm64.*\.pkg/);
});

test('r-prerelease', async t => {
    const ret = await got('http://localhost:' + port + '/r-prerelease');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-prerelease-win', async t => {
    const ret = await got('http://localhost:' + port + '/r-prerelease-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-prerelease-macos', async t => {
    const ret = await got('http://localhost:' + port + '/r-prerelease-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-versions', async t => {
    const ret = await got('http://localhost:' + port + '/r-versions');
    const obj = JSON.parse(ret.body);
    t.true(Array.isArray(obj));
    obj.map(function(x) {
        // Older versions are not semantic, but newers should be
        if (new Date(x.date) > new Date('2002-01-01')) {
            t.truthy(semver.valid(x.version), x.version);
        }
        t.regex(x.date, iso_8601_regex);
    });
});
