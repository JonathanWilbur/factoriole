const mongoose = require('mongoose');
const SchemaFor = require('./schemas.js');

module.exports = {

  Fact: mongoose.model('Fact', SchemaFor.Facts),

  User: mongoose.model('User', SchemaFor.Users),

  Session: mongoose.model('Session', SchemaFor.Sessions),

  Invite: mongoose.model('Invite', SchemaFor.Invites),

  Tag: mongoose.model('Tag', SchemaFor.Tags)

}
