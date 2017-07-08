const config = require('./configuration.js');

module.exports = {

  ifFieldsFilledIn: function (req, res, next, fields) {
    var missingField = false;
    for (var i = 0; i < fields.length; i++) {
      if (!req.body[fields[i]]) {
        res.status(400).json({
          error: "Missing required field in request: " + fields[i]
        });
        missingField = true;
        break;
      }
    }
    if (!missingField) next();
  },

  sessionCookie: function (req, res, next) {
    if (req.cookies.session) {
      if (req.cookies.session.length == 48) {
        next();
      } else {
        res.status(400).json({
          error: "Invalid session cookie."
        });
      }
    } else {
      res.status(401).json({
        error: "No session ID cookie provided. You must provide a valid session ID in the request cookie."
      });
    }
  },

  invite: function (req, res, next) {
    if (req.body.invite) {
      if (req.body.invite.length == 32) {
        next();
      } else {
        res.json({
          error: "Invalid invite."
        });
      }
    } else {
      res.status(401).json({
        error: "You must provide an invite ID in the request body to create a user."
      });
    }
  },

  ifFieldLengthWithinLimits: function (req, res, next, field, min, max) {

  },

  ifRequestContainsNoUnrecognizedKeys: function (req, res, next, keys) {

  },

  ifRequestDoesNotContainTheseKeys: function (req, res, next, keys) {
    var naughtyKeyFound = false;
    for (var i = 0; i < keys.length; i++) {
      if (req.body[keys[i]]) {
        naughtyKeyFound = true;
        break;
      }
    }
    if (naughtyKeyFound) {
      res.status(400).json({
        error: "You may not change your administrator status."
      });
    } else {
      next();
    }
  },

  ifQueryLengthAcceptable: function (req, res, next) {
    if (Object.keys(req.query).length > config.maxQueryParams) {
      res.status(414).json({
        error: "You may only use " + config.maxQueryParams + " query parameters."
      });
    } else {
      next();
    }
  },

  factQuery: {

    numberOfKeys: function (req, res, next) {
      var queryParams = Object.keys(req.query).length;
      if (queryParams > 0 && queryParams < 4) {
        next();
      } else {
        res.status(400).json({
          failure: "You must provide between one and three query parameters."
        });
      }
    },

    keys: function (req, res, next) {
      var validKeys = ["tags", "active", "author", "since", "until", "text"];
      var queryKeys = Object.keys(req.query);
      for (var q = 0; q < queryKeys.length; q++) {
        if (validKeys.indexOf(queryKeys[q]) == -1) {
          res.status(400).json({
            failure: "Invalid query keys.",
            permittedQueryKeys: validKeys,
            yourQueryKeys: queryKeys
          });
          return;
        }
      }
      next();
    },

    tags: function (req, res, next) {
      if (req.query.tags) {
        if (typeof(req.query.tags) == "array") {
          for (var t = 0; t < query.tags.length; t++) {
            if (typeof(req.query.tags[t]) != "string") {
              res.status(400).json({
                failure: "All tags in query must be string data types."
              });
              return;
            }
            if (req.query.tags[t].length > 100) {
              res.status(400).json({
                failure: "No tags may exceed 100 characters in length."
              });
              return;
            }
          }
          next();
        } else if (typeof(req.query.tags) == "string") {
          if (req.query.tags.length > 32) {
            res.status(400).json({
              failure: "No tags may exceed 32 characters in length."
            });
            return;
          }
          next();
        } else {
          res.status(400).json({
            failure: "Value of 'tags' query must either be a string or an array."
          });
          return;
        }
      } else {
        next();
      }
    },

    sinceAndUntil: function (req, res, next) {
      req.query.since = parseInt(req.query.since);
      req.query.until = parseInt(req.query.until);
      if (req.query.since) {
        if (req.query.since == NaN) {
          res.status(400).json({
            failure: "Invalid value for 'since' query."
          });
          return;
        }
        if (req.query.until == NaN) {
          res.status(400).json({
            failure: "Invalid value for 'until' query."
          });
          return;
        }
        if (req.query.since.length > 10) {
          res.status(400).json({
            failure: "Invalid value for 'since' query."
          });
          return;
        }
        if (req.query.until.length > 10) {
          res.status(400).json({
            failure: "Invalid value for 'until' query."
          });
          return;
        }
      }
      next();
    },

    author: function (req, res, next) {
      if (req.query.author && req.query.author.length > 32) {
        res.status(400).json({
          failure: "Author names can only be up to 32 characters long."
        });
        return;
      }
      next();
    },

    text: function (req, res, next) {
      if (req.query.text && req.query.text > 64) {
        res.status(400).json({
          failure: "Text searches can only be up to 64 characters long."
        });
        return;
      } else {
        next();
      }
    },

    active: function (req, res, next) {
      if (req.query.active && !(req.query.active == "true" || req.query.active == "false")) {
        res.status(400).json({
          failure: "Active must be either true or false."
        });
        return;
      }
      next();
    },

    //REVIEW: You may need to check that the fact ID actuall exists.
    id: function (req, res, next) {
      if (req.params.id.length != 24) {
        res.status(400).json({
          failure: "Invalid fact ID."
        });
        return;
      }
      next();
    }

  },

  userQuery: {

    numberOfKeys: function (req, res, next) {
      if (Object.keys(req.query).length < 3) {
        next();
      } else {
        res.status(400).json({
          failure: "You may only provide up to two query parameters."
        });
      }
    },

    keys: function (req, res, next) {
      var validKeys = ["name", "active", "email", "admin"];
      var queryKeys = Object.keys(req.query);
      for (var q = 0; q < queryKeys.length; q++) {
        if (validKeys.indexOf(queryKeys[q]) == -1) {
          res.status(400).json({
            failure: "Invalid query keys.",
            permittedQueryKeys: validKeys,
            yourQueryKeys: queryKeys
          });
          return;
        }
      }
      next();
    },

    name: function (req, res, next) {
      if (req.query.name && req.query.name.length > 32) {
        res.status(400).json({
          failure: "User name can only be up to 32 characters long."
        });
        return;
      }
      next();
    },

    active: function (req, res, next) {
      if (req.query.active && !(req.query.active == "true" || req.query.active == "false")) {
        res.status(400).json({
          failure: "Active must be either true or false."
        });
        return;
      }
      next();
    },

    admin: function (req, res, next) {
      if (req.query.admin && !(req.query.admin == "true" || req.query.admin == "false")) {
        res.status(400).json({
          failure: "Admin must be either true or false."
        });
        return;
      }
      next();
    },

    id: function (req, res, next) {
      if (req.params.id.length != 24) {
        res.status(400).json({
          failure: "Invalid user ID."
        });
        return;
      }
      next();
    }

  },

  ifAllNewUserFieldsFilledIn: function (req, res, next) {
    var requiredFields = ["username", "password", "invite"];
    for (var r = 0; r < requiredFields.length; r++) {
      if (!req.body[requiredFields[r]] && requiredFields[r] != "" && requiredFields[r] != null && requiredFields[r] != []) {
        res.status(400).json({
          error: "Missing required field.",
          missingField: requiredFields[r]
        });
        return;
      }
    }
    next();
  },

  ifAllNewFactFieldsFilledIn: function (req, res, next) {
    var requiredFields = ["fact","tags","sources"];
    for (var r = 0; r < requiredFields.length; r++) {
      if (!req.body[requiredFields[r]] && requiredFields[r] != "" && requiredFields[r] != null && requiredFields[r] != []) {
        res.status(400).json({
          error: "Missing required field.",
          missingField: requiredFields[r]
        });
        return;
      }
    }
    next();
  }

}
