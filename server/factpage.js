const mongoose = require('mongoose');
const ejs = require('ejs');
var xml = require('xml');
const ModelFor = require('./models.js');

module.exports = {

  get: function (req, res) {
    if (req.params.id.length == 24) {
      ModelFor.Fact.findOneAndUpdate({ _id: req.params.id }, { $inc: { views: 1 } }, function (err, fact) {
        if (err) {
          res.status(500).send("<h1>500</h1><div>Failed to retrieve fact from database. Sorry!</div>");
        } else {
          if (fact) {
            ejs.renderFile('/factoriole/client/fact.ejs', fact, {}, function(err, str){
              if (err) {
                res.status(500).send(JSON.stringify(err));//"<h1>500</h1><div>Failed to format response template. Sorry!</div>")
              } else {
                res.send(str);
              }
            });
          } else {
            res.send("<h1>404</h1><div>This fact cannot be found. Sorry!</div>");
          }
        }
      });
    } else {
      res.send("<h1>400</h1><div>Invalid URL, ya dingus.</div>");
    }
  },

  xml: function (req, res) {
    if (req.params.id.length == 24) {
      ModelFor.Fact.findOneAndUpdate(
        { _id: req.params.id }, 
        { $inc: { views: 1 } }, 
        {}, function (err, fact) {
        if (err) {
          res.status(500).send("<?xml version=\"1.0\" encoding=\"UTF-8\" ?><error>Error when trying to find that fact.</error>");
        } else {
          if (fact) {
            res.set('Content-Type', 'application/xml').send(xml({ hashtags: [null, null] }));
          } else {
            res.send("<?xml version=\"1.0\" encoding=\"UTF-8\" ?><error>Could not find that fact.</error>");
          }
        }
      });
    } else {
      res.send("<?xml version=\"1.0\" encoding=\"UTF-8\" ?><error>Invalid URL, ya dingus.</error>");
    }
  }

}
