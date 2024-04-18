# 2024-04

## Move to api.r-pkg.org

Has a redis DB for caching, that's easy.

Create app and DB:

```
dokku apps:create rversions2
dokku redis:create rversions2
dokku redis:link rversions2 rversions2
```

We'll try to use the password this time.

Also needs a GITHUB TOKEN:
```
dokku config:set rversions2 GITHUB_TOKEN=xxx
```

Update Dockerfile in the rversions.app project, node version etc.

```
git remote rename dokku dokku-old
git remote add dokku dokku@api.r-pkg.org:rversions2
git push dokku v2:v2
```

```
dokku letsencrypt:set rversions2 email csardi.gabor@gmail.com
dokku letsencrypt:enable rversions2
```

Do the same dance for copying the certs from the old server.

```
tar cf cert.tar server.{key,crt}
dokku domains:add rversions2 api.r-hub.io
cat cert.tar | dokku certs:add rversions2
```

Now check that the new cert is working. For this edit the /etc/hosts file
on your computer and point install-github.me to the new IP.
Then try
```
curl -v -L https://api.r-hub.io/rversions/rtools-versions
```

Now wait for admin to change the DNS.

Once the DNS updated, run letsencrypt again, to get a cert for both
domains:
```
dokku letsencrypt:enable rversions2
```
