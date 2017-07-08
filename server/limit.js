module.exports = {

  counter: {},

  ifRequestExceedsLimit: function (req, res, next, limitPerFifteenMinutes) {
    if (this.counter[req.ip]) {
      if (this.counter[req.ip][req.path]) {
        this.counter[req.ip][req.path]++;
        if (this.counter[req.ip][req.path] <= limitPerFifteenMinutes) {
          next();
        } else {
          res.status(529).json({
            error: "Request limit exceeded. You are limited to " + limitPerFifteenMinutes + " requests to " + req.path + " per fifteen minutes."
          });
        }
      } else {
        this.counter[req.ip][req.path] = 1;
        next();
      }
    } else {
      this.counter[req.ip] = {};
      this.counter[req.ip][req.path] = 1;
      next();
    }

  },

  resetCounter: function () {
    this.counter = {};
  }

}
