import test from 'ava';
import got from 'got';
import semver from 'semver';
import iso_8601_regex from '../lib/iso-8601-regex.js';
const port = 3000;

test('unknown endpoint', async t => {
    const resp = await got(
        'http://localhost:' + port + '/foobar',
        { throwHttpErrors: false }
    );
    t.is(resp.statusCode, 404);
});

test('index page', async t => {
    const ret = await got('http://localhost:' + port + '/rversions');
    t.regex(
        ret.body,
        /Download OpenAPI specification/
    );
});


test('r-release', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
});

test('r-oldrel', async t => {
    const pvers = [ got('http://localhost:' + port + '/rversions/r-oldrel'),
                    got('http://localhost:' + port + '/rversions/r-release') ];
    const vers = await Promise.all(pvers);
    const od = JSON.parse(vers[0].body);
    const nw = JSON.parse(vers[1].body);
    t.true(semver.lt(od.version, nw.version));
    t.regex(od.date, iso_8601_regex);
});

test('r-release-tarball', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release-tarball');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-release-win', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-release-macos', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-release-macos-x86_64', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release-macos-x86_64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-release-macos-arm64', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-release-macos-arm64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.regex(obj.date, iso_8601_regex);
    t.regex(obj.URL, /https?:\/\/.*arm64.*\.pkg/);
});

test('r-next', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-next');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-next-win', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-next-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-next-macos', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-next-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-next-macos-x86_64', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-next-macos-x86_64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-next-macos-arm64', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-next-macos-arm64');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*arm64.*\.pkg/);
});

test('r-prerelease', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-prerelease');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.tar\.gz$/);
});

test('r-prerelease-win', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-prerelease-win');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.exe$/);
});

test('r-prerelease-macos', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-prerelease-macos');
    const obj = JSON.parse(ret.body);
    t.truthy(semver.valid(obj.version));
    t.true(obj.date === null);
    t.regex(obj.URL, /https?:\/\/.*\.pkg/);
});

test('r-versions', async t => {
    const ret = await got('http://localhost:' + port + '/rversions/r-versions');
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
