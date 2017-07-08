# Factoriole

Factoriole is a simple searchable fact database.

## Installation and Setup

Get ready, because setting up Factoriole is not easy.

### File placement

All of the files of ParanoYak need to be installed in a root-level directory
named `factoriole`. When installed, the path to `main.js` should be 
`/factoriole/server/main.js`. If this is the case, then you have installed the
files to the correct location.

### TLS Configuration

You need to acquire a TLS certiciate and key for your server. I recommend using
[CertBot](https://certbot.eff.org/) to acquire a 
[Let's Encrypt](https://letsencrypt.org/) TLS Certificate. 

Some browsers (reasonably) require a full TLS certificate chain, whereas others
only require just the standalone certificate. To create the certificate chain,
simply run the following command, substituting the names of the certificate
files: `cat rootca.pem intermediateca.pem yourcert.pem > fullchain.pem`.

I do not have the time to teach you all about TLS, so if that doesn't work for
you, StackOverflow is your friend.

Once you have a certificate, a key, and a full certificate chain, you will need
the file names to be these respectively:

* `cert.pem`
* `privkey.pem`
* `fullchain.pem`

And the will need to be placed in the `/factoriole/server/ssl` directory.
Alternatively, you might be able to get away with making this files symbolic
links to files elsewhere on the system, but I haven't tried that, so I can't
say for sure if it would work.

### MongoDB Setup

You will need to set up a MongoDB instance somewhere (it does not have to be
on the same host on which you run Factoriole). You must create a database
called `factoriole` and a user with full-administrative permissions over it
also named `factoriole`. You will need to supply the password to the
configuration file in `server/configuration.json`.

### User Setup

You will need to create the first user (who must also be an administrator) in
the `users` collection, and set `admin` to `true`. The included JSON
file `server/seedUser.json` has all the fields a user object uses. 
Some of them are required, some are not. Use your common sense to determine
which ones are. Once you have an admin set up, the admin can create invite
links to invite other users.

Once you are logged in as the administrator, you can create invite links for
other users by navigating to `/invite`. A link will automatically generate.

### Configuration

You will then need to supply some other configuration directives in 
`server/configuration.json`. Everything there is pretty self-explanatory.

### Running Factoriole.

You can run ParanoYak with `npm start` or `/factoriole/server/main.js`. Make
sure there is an opening in your firewall for ports 80 and 443, for HTTP and
HTTPS respectively. You might need to run it as administrator, but I can't
remember.

## Technical Details

* Uses NodeJS, ExpressJS, MongooseJS, and MongoDB on the back end
* Users AngularJS on the front end
* Meant only for Linux, but can run on Mac OS devices.

## Todo

- [ ] Full-blown Twitter Integration
- [ ] SMTP API

## See Also

* [CertBot](https://certbot.eff.org/)
* [Let's Encrypt](https://letsencrypt.org/)

## Contact Me

If you would like to suggest fixes or improvements on this library, please just
comment on this on GitHub. If you would like to contact me for other reasons,
please email me at [jonathan@wilbur.space](mailto:jonathan@wilbur.space). :boar: