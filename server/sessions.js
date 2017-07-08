//TODO: Make sure you uncomment the secure: true lines for production!
const mongoose = require('mongoose');
const crypto = require('crypto');
const config = require('./configuration.js');
const ModelFor = require('./models.js');

module.exports = {

  post: function (req, res) {
    crypto.randomBytes(24, (err, buf) => {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when generating random bytes for session ID."
        });
      } else {
        var sha256 = crypto.createHash('sha256');
        sha256.update(buf.toString('hex'));
        ModelFor.Session.create({
          sha256: sha256.digest('hex'),
          user: req.user,
          username: req.username,
          timestamp: new Date()
        }, function (err) {
          if (err) {
            res.status(500).json({
              error: "Internal server error when trying to insert new session into database."
            });
          } else {
            res.status(201);
            var cookieOptions = {
              //secure: true,
              httpOnly: true
            };
            if (req.body.keepMeLoggedIn == true) cookieOptions.maxAge = 2678400000; //Expire in one month
            res.cookie('session', buf.toString('hex'), cookieOptions).cookie('loggedIn', true).json({
              authenticated: true
            });
          }
        });
      }
    });
  },

  delete: {

    current: function (req, res) {
      var sha256 = crypto.createHash('sha256');
      sha256.update(req.cookies.session);
      var sessionHash = sha256.digest('hex');
      ModelFor.Session.findOneAndRemove({ sha256: sessionHash }, function (err) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to delete session from database."
          });
        } else {
          res.clearCookie('session').clearCookie('loggedIn').json({ sessionDeleted: true });
        }
      });
    },

    allForUser: function (req, res) {
      ModelFor.Session.count({ user: req.params.id }, function (err, count) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to count sessions for this user."
          });
        } else {
          if (count == 0) {
            res.json({
              warning: "No sessions found for this user. No action taken."
            });
          } else {
            ModelFor.Session.remove({ user: req.params.id }, function (err) {
              if (err) {
                res.status(500).json({
                  error: "Internal server failure when trying to delete all sessions for given user."
                });
              } else {
                res.json({
                  success: "All sessions for the given user have been deleted.",
                  numberOfSessionsDeleted: count
                });
              }
            });
          }
        }
      });
    }

  },

  removeOldestTwoIfThisUserHasTooMany: function (req, res, next) {
    ModelFor.Session.count({ user: req.user }, function (err, count) {
      if (err) {
        res.status(500).json({
          error: "Internal server error when trying to count current number of sessions for this user."
        });
      } else {
        if (count >= config.maxSessions) {
          ModelFor.Session.find({ user: req.user })
          .sort({ timestamp: 1 })
          .limit(2).exec(function (err, docs) {
            if (err) {
              res.status(500).json({
                error: "Internal server failure when trying to delete old sessions."
              });
            } else {
               for (var i = 0; i < docs.length; i++) {
                 ModelFor.Session.remove({ _id: docs[i]._id }).exec();
               }
            }
          });
        }
        next();
      }
    });
  }

}
