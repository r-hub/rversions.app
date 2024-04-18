
# 2024-04

## Moving to new api.r-pkg.org

This is very simple, it is in the `old` branch of
`r-hub/rversions.app`: https://github.com/r-hub/rversions.app/tree/old

Need to create a Dockerfile, etc. just like for install-github.me.
It is pretty much the same, we need to redirect rversions.r-pkg.org to
the new IP.

```
dokku apps:create rversions
```

Then locally:
```
git remote add dokku dokku@api.r-pkg.org:rversions
git push dokku old:main
```

Do the same dance for copying the certs from the old server.

```
dokku domains:add rversions rversions.r-pkg.org
tar cf cert.tar server.{key,crt}
cat cert.tar | dokku certs:add rversions
```

Edit `/etc/hosts` locally to test.

Update DNS. rversions is proxied by Cloudflare, so turn off the
proxy temporarily, to make sure everything works correctly.
Turn the proxy back on at the end.

```
dokku letsencrypt:set rversions email csardi.gabor@gmail.com
dokku letsencrypt:enable rversions
```

Enable proxy again.

Stop old rversions app a couple of hours later.

