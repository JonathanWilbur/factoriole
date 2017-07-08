const mongoose = require('mongoose');
const crypto = require('crypto');
const ModelFor = require('./models.js');

module.exports = {

  get: {

    byID: function (req, res) {
      ModelFor.User.findOne({ _id: req.params.id }, '-password -__v', function (err, user) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to query database for matching users."
          });
        } else {
          res.json(user);
        }
      });
    },

    byQuery: function (req, res) {
      ModelFor.User.find(req.query, '-password -__v', function (err, users) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to query database for matching users."
          });
        } else {
          res.json(users);
        }
      });
    }

  },

  post: function (req, res) {
    var sha256 = crypto.createHash('sha256');
    var salt = (new Date()).toString();
    sha256.update(salt);
    sha256.update(req.body.password);
    var newUser = {
      username: req.body.username,
      password: {
        sha256: sha256.digest('hex'),
        salt: salt
      },
      admin: false,
      active: true,
      email: req.body.email,
      created: new Date()
    };
    ModelFor.User.create(newUser, function(err, user) {
      if (err) {
        res.status(500).json({
          error: "Internal server error when trying to add new user to database."
        });
      } else {
        res.status(201).json({
          userCreated: true,
          username: req.body.username,
          emailSentTo: req.body.email
        });
      }
    });
  },

  patch: function (req, res) {
    if (req.body._id) {
      res.status(400).json({
        error: "You may not change IDs. Operation aborted."
      });
    } else {
      ModelFor.User.update({ _id: req.params.id }, req.body, function(err) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to update user."
          });
        } else {
          res.json({
            userUpdated: true
          });
        }
      });
    }
  },

  lock: function (req, res) {
    ModelFor.User.count({ _id: req.params.id }, function (err, count) {
      if (err) {
        res.json({
          error: "Internal server failure when trying to count matching users."
        });
      } else {
        if (count == 0) {
          res.status(404).json({
            error: "No such user found."
          });
        } else {
          ModelFor.User.update({ _id: req.params.id }, { active: false }, function (err) {
            if (err) {
              res.status(500).json({
                error: "Internal server failure when trying to disable user."
              });
            } else {
              res.json({
                userDisabled: true
              });
            }
          });
        }
      }
    });
  },

  unlock: function (req, res) {
    ModelFor.User.count({ _id: req.params.id }, function (err, count) {
      if (err) {
        res.json({
          error: "Internal server failure when trying to count matching users."
        });
      } else {
        if (count == 0) {
          res.status(404).json({
            error: "No such user found."
          });
        } else {
          ModelFor.User.update({ _id: req.params.id }, { active: true }, function (err) {
            if (err) {
              res.status(500).json({
                error: "Internal server failure when trying to enable user."
              });
            } else {
              res.json({
                userEnabled: true
              });
            }
          });
        }
      }
    });
  },

  // delete: function (req, res) {
  //   ModelFor.User.count({ _id: req.params.id }, function (err, count) {
  //     if (err) {
  //       res.status(500).json({
  //         error: "Internal server failure when trying to count matching users."
  //       });
  //     } else {
  //       if (count == 0) {
  //         res.status(404).json({
  //           error: "No such user found."
  //         });
  //       } else {
  //         ModelFor.User.remove({ _id: req.params.id }, function (err) {
  //           if (err) {
  //             res.status(500).json({
  //               error: "Internal server failure when trying to delete user."
  //             });
  //           } else {
  //             res.json({
  //               userDeleted: true
  //             });
  //           }
  //         });
  //       }
  //     }
  //   });
  //},

  password: {

    patch: function (req, res) {
      ModelFor.User.findOne({ _id: req.params.id }, function (err, user) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to retrieve user by ID from database."
          });
        } else {
          var salt = new Date();
          var sha256 = crypto.createHash('sha256');
          sha256.update(salt);
          sha256.update(req.body.newPassword);
          var passhash = sha256.digest('hex');
          ModelFor.User.update({ _id: req.params.id }, { "password.salt": salt, "password.sha256": passhash }, function (err) {
            if (err) {
              res.status(500).json({
                error: "Internal server failure when trying to change password in database."
              });
            } else {
              res.json({
                success: "Password changed."
              });
            }
          });
        }
      });
    }

  },

  admin: {

    patch: function (req, res) {
      ModelFor.User.findByIdAndUpdate(req.params.id, { admin: req.body.admin }, function (err, user) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to change user's administrative status."
          });
        } else {
          res.json({
            success: "User promoted to administrator."
          });
        }
      });
    }

  }

}
