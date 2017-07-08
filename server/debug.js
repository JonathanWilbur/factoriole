module.exports = {

  logQuery: function (req, res, next) {
    console.log(req.query + "\n\n\n");
  },

  logBody: function (req, res, next) {
    console.log(req.body + "\n\n\n");
  }

}
