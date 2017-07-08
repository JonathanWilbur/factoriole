const crypto = require('crypto');
const ModelFor = require('./models.js');

module.exports = {

  ifSessionIsValid: function (req, res, next) {
    if (req.cookies.session) {
      var sha256 = crypto.createHash('sha256');
      sha256.update(req.cookies.session);
      var sessionHash = sha256.digest('hex');
      ModelFor.Session.findOne({ sha256: sessionHash }, function(err, session) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to validate session ID."
          });
        } else {
          if (session) {
            req.user = session.user;
            next();
          } else {
            res.status(403).json({
              failure: "Unauthorized. The session ID cookie you presented was not valid."
            });
          }
        }
      });
    } else {
      res.status(401).json({
        failure: "Unauthenticated. You must provide a valid session ID in cookies."
      });
    }
  },

  ifSessionIsAdmin: function (req, res, next) {
    if (req.cookies.session) {
      var sha256 = crypto.createHash('sha256');
      sha256.update(req.cookies.session);
      var sessionHash = sha256.digest('hex');
      ModelFor.Session.findOne({ sha256: sessionHash }, function(err, session) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to validate session ID."
          });
        } else {
          if (session) {
            ModelFor.User.findOne({ _id: session.user }, function (err, user) {
              if (err) {
                res.status(500).json({
                  error: "Internal server failure when verifying that session belongs to an administrator."
                });
              } else {
                if (user) {
                  if (user.admin == true) {
                    next();
                  } else {
                    res.status(403).json({
                      failure: "Unauthorized. The session ID cookie you presented is valid, but you are not an administrator, and this action requires administrative privileges."
                    });
                  }
                } else {
                  res.status(500).json({
                    error: "Internal server failure when looking up user from session ID."
                  });
                }
              }
            });
          } else {
            res.status(403).json({
              failure: "Unauthorized. The session ID cookie you presented was not valid."
            });
          }
        }
      });
    } else {
      res.status(401).json({
        failure: "Unauthenticated. You must present a valid session ID cookie."
      });
    }
  },

  ifInviteIsValid: function (req, res, next) {
    ModelFor.Invite.findOneAndRemove({ invite: req.body.invite }, function (err, doc, result) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when trying to find and remove invite in database."
        });
      } else {
        if (doc) {
          next();
        } else {
          res.status(401).json({
            error: "Unauthenticated. Invite ID is invalid."
          });
        }
      }
    });
  },

  ifSessionBelongsToThisUser: function (req, res, next) {
    var sha256 = crypto.createHash('sha256');
    sha256.update(req.cookies.session);
    var sessionHash = sha256.digest('hex');
    ModelFor.Session.findOne({ sha256: sessionHash }, function (err, session) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when trying to find session provided by cookie."
        });
      } else {
        if (session) {
          if (session.user == req.params.id) {
            next();
          } else {
            res.status(403).json({
              error: "You are not authorized to modify other users."
            });
          }
        } else {
          res.status(401).json({
            error: "Session ID provided by cookie did not match any session ID in the database."
          });
        }
      }
    });
  },

  afterRandomWait: function (req, res, next) {
    var randomWait = Math.ceil(Math.random() * 10);
    setTimeout(function () {
      next();
    }, randomWait);
  },

  ifCredentialsAreCorrect: function (req, res, next) {
    ModelFor.User.findOne({ username: req.body.username.toLowerCase() }, function (err, user) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when trying to retrieve user by name."
        });
      } else {
        if (user) {
          var sha256 = crypto.createHash('sha256');
          sha256.update(user.password.salt);
          sha256.update(req.body.password);
          var passhash = sha256.digest('hex');
          if (user.password.sha256 == passhash) {
            req.userid = user._id;
            req.user = user._id;
            req.username = user.username;
            next();
          } else {
            res.status(401).json({
              failure: "Incorrect credentials"
            });
          }
        } else {
          res.status(401).json({
            failure: "Incorrect credentials."
          });
        }
      }
    });
  },

  ifUsernameNotAlreadyTaken: function (req, res, next) {
    ModelFor.User.count({ name: req.body.username.toLowerCase() }, function (err, count) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when checking that username is not already taken."
        });
      } else {
        if (count == 0) {
          next();
        } else {
          res.status(400).json({
            failure: "Username is already taken."
          });
        }
      }
    });
  },

  ifEmailNotAlreadyTaken: function (req, res, next) {
    if (req.body.email && req.body.email != "") {
      ModelFor.User.count({ email: req.body.email.toLowerCase() }, function (err, count) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when checking that the email address is not already in use."
          });
        } else {
          if (count == 0) {
            next();
          } else {
            res.status(400).json({
              failure: "Email address is associated with another account."
            });
          }
        }
      });
    } else {
      next();
    }
  },

  ifFactNotAlreadySubmitted: function (req, res, next) {
    ModelFor.Fact.count({ fact: req.body.fact }, function (err, count) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when checking that fact was not already submitted."
        });
      } else {
        if (count == 0) {
          next();
        } else {
          res.status(400).json({
            failure: "Fact already submitted."
          });
        }
      }
    });
  },

  ifAccountIsActive: function (req, res, next) {
    ModelFor.User.findOne({ _id: req.user }, function (err, user) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when checking if user's account is active."
        });
      } else {
        if (user) {
          if (user.active == true) {
            next();
          } else {
            res.status(403).json({
              failure: "This account is locked. Please contact an administrator if your account has been locked in error."
            });
          }
        } else {
          res.status(500).json({
            error: "User could not be found!"
          });
        }
      }
    });
  }

}
