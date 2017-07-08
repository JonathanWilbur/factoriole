const mongoose = require('mongoose');
const ModelFor = require('./models.js');

module.exports = {

  numberOfTags: function (req, res) {
    ModelFor.Tags.count({}, function (err, count) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when trying to count all tags."
        });
      } else {
        res.json({
          numberOfTags: count
        });
      }
    });
  },

  numberOfSpecificTag: function (req, res) {
    ModelFor.Tags.count({ tag: req.body.tag }, function (err, count) {
      if (err) {
        res.status(500).json({
          error: "Internal server failure when trying to count occurences of the tag '" + req.body.tag + "'"
        });
      } else {
        res.json({
          tag: req.body.tag,
          factsUsingThisTag: count
        });
      }
    });
  }

}
