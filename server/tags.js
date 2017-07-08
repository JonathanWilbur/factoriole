const mongoose = require('mongoose');
const ModelFor = require('./models.js');

module.exports = {

  get: {

    top: function (req, res) {
      var query = ModelFor.Tag.find({}).select('-_id -__v').sort({ "count": -1 });

      if (req.query.limit) {
        query.limit(parseInt(req.query.limit));
      } else {
        query.limit(10);
      }

      query.exec(function (err, tags) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to retrieve top tags."
          });
        } else {
          res.json(tags);
        }
      });
    },

    bottom: function (req, res) {
      var query = ModelFor.Tag.find({}).sort({ "count": 1 });

      if (req.query.limit) {
        query.limit(parseInt(req.query.limit));
      } else {
        query.limit(10);
      }

      query.exec(function (err, tags) {
        if (err) {
          res.status(500).json({
            error: "Internal server failure when trying to retrieve top tags."
          });
        } else {
          res.json(tags);
        }
      });
    }

  }

}
