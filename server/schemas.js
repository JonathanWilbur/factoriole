const mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {

  Facts: new mongoose.Schema({
    fact: { type: String, required: [true, "Missing 'fact' key."], maxlength: 140, trim: true, text: true },
    tags: { type: [String], required: [true, "Missing 'tags' key."], index: true }, //NOTE: You cannot use 'maxLength' on an array.
    hashtags: { type: [String] },
    author: { type: ObjectId, required: [true, "Missing 'author' key."], index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    active: { type: Boolean, required: true, index: true },
    details: { type: String, trim: true },
    related: { type: [ObjectId] },
    views: { type: Number, required: [true, "Missing 'views' field."], min: 0 },
    sources: [{
      citationMLA: { type: String, required: [true, "Missing 'citationMLA' key."] },
      publicationTime: { type: Date },
      organization: { type: String },
      authors: { type: [String] }
    }]
  },
  {
    autoIndex: true
  }),

  Users: new mongoose.Schema({
    username: { type: String, required: [true, "Name is required."], index: true, lowercase: true, trim: true, unique: true },
    password: {
      sha256: { type: String, required: [true, "SHA256 Hash of password required in password.sha256 field."], maxlength: 257 },
      salt: { type: String, required: [true, "Salt of type String required in password.salt."] }
    },
    admin: { type: Boolean, required: [true, "Must specify whether user is admin in admin key."] },
    active: { type: Boolean, required: [true, "Must specify whether user is active in active key."], default: true },
    email: { type: String, lowercase: true, trim: true, unique: true }
  },
  {
    autoIndex: true
  }),

  Sessions: new mongoose.Schema({
    sha256: { type: String, required: [true, "SHA256 hash of session ID must be supplied in sha256 field."], maxlength: 257 },
    user: { type: ObjectId, required: [true, "ObjectId required in user field."] },
    username: { type: String, required: [true, "Username required in username field."] },
    timestamp: { type: Date, required: [true, "Creation timestamp required in timestamp field."] }
  }),

  Invites: new mongoose.Schema({
    invite: { type: String, required: [true, "Invite required in invite field."] },
    createdBy: { type: ObjectId, required: [true, "ObjectId of User required in createdBy field."] },
    timestamp: { type: Date, required: [true, "Timestamp required in timestamp field."] }
  }),

  Tags: new mongoose.Schema({
    tag: { type: String, required: [true, "Tag required."], index: true },
    count: { type: Number, required: true, default: 0 }
  },
  {
    autoIndex: true
  })

}
