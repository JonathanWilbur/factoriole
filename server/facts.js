const mongoose = require('mongoose');
const ModelFor = require('./models.js');

module.exports = {

  get: {

    byID: function (req, res) {
      ModelFor.Fact.findOne({ _id: req.params.id }, '-__v -sources.id', function (err, fact) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when retrieving fact by ID."
          });
        } else {
          if (fact) {
            res.json(fact);
          } else {
            res.status(404).json({
              error: "No such fact found."
            });
          }
        }
      });
    },

    byQuery: function (req, res) {

      var query;
      if (req.query.tags) {
        query = ModelFor.Fact.find({ tags: req.query.tags }).select('-__v -sources._id');
      } else {
        query = ModelFor.Fact.find({ $text: { $search: req.query.text } }).select('-__v -sources._id');
      }

      if (req.query.active != "false") {
        query.where('active', true);
      }
      if (req.query.since) {
        query.where('timestamp').gt(parseInt(req.query.since));
      }
      if (req.query.until) {
        query.where('timestamp').lt(parseInt(req.query.since));
      }
      if (req.query.limit && parseInt(req.query.limit) < 25) {
        query.limit(parseInt(req.query.limit));
      } else {
        query.limit(25)
      }

      query.exec(function (err, facts) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when retrieving facts by query.",
            message: JSON.stringify(err)
          });
        } else {
          if (facts.length == 0) {
            res.status(404).json({
              error: "No such facts found."
            });
          } else {
            res.json(facts);
          }
        }
      });
    },

    random: function (req, res) {
      ModelFor.Fact.aggregate(
        { $sample: { size: parseInt(req.query.limit) || 1 }})
        .exec(function (err, facts) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to gather a random fact.",
            details: JSON.stringify(err)
          });
        } else {
          res.json(facts);
        }
      });
    },

    recent: function (req, res) {
      ModelFor.Fact.find({ active: true })
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit) || 10)
      .exec(function (err, facts) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to retrieve the most recent facts."
          });
        } else {
          res.json(facts);
        }
      });
    }

  },

  post: function (req, res) {
    ModelFor.Fact.create({
      fact: req.body.fact,
      tags: req.body.tags,
      hashtags: req.body.hashtags,
      author: req.user,
      timestamp: new Date,
      active: true,
      details: req.body.details,
      views: 0,
      related: req.body.related,
      sources: req.body.sources
    }, function (err, fact) {
      if (err) {
        res.status(500).json({
          //error: "Internal server failure when trying to post new fact.",
          details: JSON.stringify(err)
        });
      } else {
        res.status(201).json({ inserted: true, id: fact._id });
      }
    });
    for (var t = 0; t < req.body.tags.length; t++) {
      ModelFor.Tag.findOneAndUpdate({ tag: req.body.tags[t] }, { $inc: { count: 1 } }, { upsert: true }).exec();
    }
  },

  patch: function (req, res) {
    ModelFor.Fact.update({ _id: req.params.id }, {
        fact: req.body.fact,
        tags: req.body.tags,
        hashtags: req.body.hashtags,
        details: req.body.details,
        related: req.body.related,
        sources: req.body.sources
      }, function (err) {
      if (err) {
        res.status(501).json({
          error: "Internal server failure when trying to modify fact.",
          details: JSON.stringify(err)
        });
      } else {
        res.json({
          factModified: true
        });
      }
    });
  },

  lock: function (req, res) {
    ModelFor.Fact.update({ _id: req.params.id }, { active: false }, function (err) {
      if (err) {
        res.status(501).json({
          error: "Internal server failure when trying to deactivate fact.",
          factDeactivated: false
        });
      } else {
        res.json({
          factDeactivated: true
        });
      }
    });
  },

  unlock: function (req, res) {
    ModelFor.Fact.update({ _id: req.params.id }, { active: true }, function (err) {
      if (err) {
        res.status(501).json({
          error: "Internal server failure when trying to activate fact.",
          factActivated: false
        });
      } else {
        res.json({
          factActivated: true
        });
      }
    });
  }//,

  // delete: function (req, res) {
  //   ModelFor.Fact.remove({ _id: req.params.id }, function (err) {
  //     if (err) {
  //       res.status(500).json({
  //         error: "Internal server failure when trying to delete user."
  //       });
  //     } else {
  //       res.json({ deleted: true });
  //     }
  //   });
  // }

}
