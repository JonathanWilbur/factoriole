module.exports = {

  byAddingActiveEqualsTrue: function (req, res, next) {
    if (!req.query.active) req.query.active = true;
    next();
  },

  byConvertingAllTagsToLowerCase: function (req, res, next) {
    for (var t = 0; t < req.body.tags.length; t++) {
      req.body.tags[t].toLowerCase();
    }
    next();
  }

}
