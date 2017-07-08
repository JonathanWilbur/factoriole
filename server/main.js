//TODO: Validate that tags are not duplicates
//TODO: Strip spaces and special characters from tags.
//TODO: Email list functionality
//TODO: Secure cookies
//TODO: HTTP Protocol Upgrade
//TODO: Implement logging
//TODO: Implement Regex Patterns on all user input fields.
//TODO: Implement an 'edit' page.
//TODO: Implement 'error' pages for HTTP requests to secure pages.
//TODO: Implement actual limits loop!
//REVIEW: Make sure that 'views' field works for facts
//REVIEW: Make sure all sort orders are correct
//REVIEW: Remove 'count' as a query option.

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const limit = require('./limit.js');
const authorize = require('./authorize.js');
const validate = require('./validate.js');
const facts = require('./facts.js');
const factpage = require('./factpage.js');
const users = require('./users.js');
const sessions = require('./sessions.js');
const invites = require('./invites.js');
const stats = require('./stats.js');
const admin = require('./admin.js');
const debug = require('./debug.js');
const tags = require('./tags.js');
const preprocess = require('./preprocess.js');
const SchemaFor = require('./schemas.js');
const configuration = require('./configuration.js');

var httpApp = express();
var httpsApp = express();
mongoose.connect('mongodb://factoriole:' + configuration.databasePassword + '@localhost:27017/factoriole');
SchemaFor.Facts.index({ fact: 'text' });

httpApp.use(express.static('/factoriole/client'));
httpApp.use(bodyParser.json());
httpApp.use(cookieParser());

//Fact pages
httpApp.get('/fact/:id', factpage.get);
httpApp.get('/xml/:id', factpage.xml);

//Fact API
httpApp.route('/facts')
.get(
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  validate.factQuery.numberOfKeys,
  validate.factQuery.keys,
  validate.factQuery.tags,
  validate.factQuery.author,
  validate.factQuery.sinceAndUntil,
  validate.factQuery.text,
  validate.factQuery.active,
  preprocess.byAddingActiveEqualsTrue,
  facts.get.byQuery
);

httpApp.get('/facts/random',
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  facts.get.random
);

httpApp.get('/facts/recent',
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  facts.get.recent
);

httpApp.route('/facts/:id')
.all(validate.factQuery.id)
.get(
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 1000); },
  facts.get.byID
);

//User API
httpApp.route('/users')
.get(
  validate.userQuery.numberOfKeys,
  validate.userQuery.keys,
  validate.userQuery.name,
  validate.userQuery.active,
  validate.userQuery.admin,
  preprocess.byAddingActiveEqualsTrue,
  users.get.byQuery
);

httpApp.route('/users/:id')
.all(validate.userQuery.id)
.get(
  users.get.byID
);

//Tags API
httpApp.get('/tags/top', tags.get.top);
httpApp.get('/tags/bottom', tags.get.bottom);

httpApp.listen(80);


//HTTPS ONLY BELOW THIS LINE

httpsApp.use(express.static('/factoriole/client'));
httpsApp.use(bodyParser.json());
httpsApp.use(cookieParser());

//Fact pages
httpsApp.get('/fact/:id', factpage.get);

//Fact API
httpsApp.route('/facts')
.get(
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  validate.factQuery.numberOfKeys,
  validate.factQuery.keys,
  validate.factQuery.tags,
  validate.factQuery.author,
  validate.factQuery.sinceAndUntil,
  validate.factQuery.text,
  validate.factQuery.active,
  preprocess.byAddingActiveEqualsTrue,
  facts.get.byQuery
)
.post(
  authorize.ifSessionIsValid,
  authorize.ifAccountIsActive,
  validate.ifAllNewFactFieldsFilledIn,
  authorize.ifFactNotAlreadySubmitted,
  preprocess.byConvertingAllTagsToLowerCase,
  facts.post
);

httpsApp.get('/facts/random',
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  facts.get.random
);

httpsApp.get('/facts/recent',
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 100); },
  facts.get.recent
);

httpsApp.route('/facts/:id')
.all(validate.factQuery.id)
.get(
  function (req, res, next) { limit.ifRequestExceedsLimit(req, res, next, 1000); },
  facts.get.byID
)
.patch(
  authorize.ifSessionIsValid,
  facts.patch
)
.lock(
  authorize.ifSessionIsAdmin,
  facts.lock
)
.unlock(
  authorize.ifSessionIsAdmin,
  facts.unlock
);

//User API
httpsApp.route('/users')
.get(
  validate.userQuery.numberOfKeys,
  validate.userQuery.keys,
  validate.userQuery.name,
  validate.userQuery.active,
  validate.userQuery.admin,
  preprocess.byAddingActiveEqualsTrue,
  users.get.byQuery
)
.post(
  validate.ifAllNewUserFieldsFilledIn,
  authorize.ifUsernameNotAlreadyTaken,
  authorize.ifEmailNotAlreadyTaken,
  authorize.ifInviteIsValid,
  users.post
);

httpsApp.route('/users/:id')
.all(validate.userQuery.id)
.get(
  users.get.byID
)
.lock(
  authorize.ifSessionIsAdmin,
  users.lock
)
.unlock(
  authorize.ifSessionIsAdmin,
  users.unlock
);

httpsApp.patch('/users/:id/password',
  validate.userQuery.id,
  authorize.ifSessionBelongsToThisUser,
  users.password.patch
);

httpsApp.patch('/users/:id/admin',
  validate.userQuery.id,
  authorize.ifSessionIsAdmin,
  users.admin.patch
);

//Sessions API
httpsApp.route('/sessions')
.post(
  authorize.afterRandomWait,
  authorize.ifCredentialsAreCorrect,
  authorize.ifAccountIsActive,
  sessions.removeOldestTwoIfThisUserHasTooMany,
  sessions.post
)
.delete(
  sessions.delete.current
);

httpsApp.delete('/sessions/user/:id',
  validate.userQuery.id,
  authorize.ifSessionBelongsToThisUser,
  sessions.delete.allForUser
);

//Invites API
httpsApp.post('/invites',
  authorize.ifSessionIsAdmin,
  invites.post
);
httpsApp.delete('/invites/:id',
  authorize.ifSessionIsAdmin,
  invites.delete
);

//Tags API
httpsApp.get('/tags/top', tags.get.top);
httpsApp.get('/tags/bottom', tags.get.bottom);

https.createServer({
  key: fs.readFileSync('/factoriole/server/ssl/privkey.pem'),
  cert: fs.readFileSync('/factoriole/server/ssl/fullchain.pem')
}, httpsApp).listen(443);
