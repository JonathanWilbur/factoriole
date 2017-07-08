var Mbox = require('node-mbox');
var MailParser = require('mailparser').MailParser;
var Email = require('email').Email;
var fs = require('fs');

fs.watch('/var/mail/api', function (eventType, filename) {

  console.log("Mbox changed! Event type: " + eventType);

  var mailbox  = fs.readFileSync('/var/mail/api');
  var mbox = new Mbox(mailbox, { /* options */ });

  mbox.on('message', function(msg) {
    //might want to clear the mbox here.
    fs.writeFileSync('/var/mail/api', ""); //delete the mailbox whenever a message is received.
    var mailparser = new MailParser({ streamAttachments : true });
    mailparser.on('end', function(mail_object) {
      console.log("From " + mail_object.from[0].address);
      var response = new Email({
        from: 'api@localhost',
        to: mail_object.from[0].address,
        subject: "Random fact",
        body: "Body of the random fact."
      });
      response.send(function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Sent response!");
        }
      });
    });
    mailparser.write(msg);
    mailparser.end();
  });

  mbox.on('error', function(err) {
    console.log('got an error', err);
  });

  // mbox.on('end', function() {
  //   console.log('done reading mbox file');
  // });

});
