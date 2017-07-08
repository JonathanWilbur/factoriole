const crypto = require('crypto');
const ModelFor = require('./models.js');

module.exports = {

  post: function (req, res) {
    var sha256 = crypto.createHash('sha256');
    sha256.update(req.cookies.session);
    var sessionHash = sha256.digest('hex');
    ModelFor.Session.findOne({ sha256: sessionHash }, function (err, session) {
      if (err) {
        res.status(500).json({
          error: "Internal server error when trying to find inviter ID from session."
        });
      } else {
        if (session) {
          crypto.randomBytes(16, (err, buf) => {
            if (err) {
              res.status(500).json({
                error: "Internal server failure when generating invite ID."
              });
            } else {
              var invite = buf.toString('hex');
              ModelFor.Invite.create({
                invite: invite,
                createdBy: session.user,
                timestamp: new Date()
              }, function (err, newInvite) {
                if (err) {
                  res.status(500).json({
                    error: "Internal server error when trying to insert invite into database."
                  });
                } else {
                  res.status(201).json({
                    inviteCreated: true,
                    invite: invite
                  });
                }
              });
            }
          });
        } else {
          res.status(500).json({
            error: "Internal server error when no user ID was associated with the session ID."
          });
        }
      }
    });
  },

  delete: function (req, res) {
    ModelFor.Invite.remove({ invite: req.params.id }, function (err) {
      if (err) {
        res.status(500).json({
          error: "Internal server when trying to delete invite."
        });
      } else {
        res.json({
          inviteDeleted: true
        });
      }
    });
  }

}
