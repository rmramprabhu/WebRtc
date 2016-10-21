define(['jquery'], function ($) { 

  var wscSession = null,
      messagingPackage = null,
      targetInput = $('input.messaging-target'),
      messageInput = $('input.messaging-message'),
      sendButton = $('button.messaging-send-btn'),
      messageTemplate = $('.messaging-template'),
      messageBox = $('.messaging-chat-box');

  /**
   * Bind event handler to Send button.
   */
  sendButton.on('click', function() {
    sendMessage();
  });
  
  /**
   * Initialization method for Messaging, this method will be exposed.
   */
  var init = function(session) {
    wscSession = session;
    targetInput.get(0).disabled = false;
    messageInput.get(0).disabled = false;
    sendButton.get(0).disabled = false;
    messagingPackage = new wsc.MessagingPackage(wscSession);
    messaging = messagingPackage.createMessaging();
    messaging.onNewMessage = onNewMessage;
    messaging.onSuccessResponse = onSuccessResponse;
    messaging.onErrorResponse = onErrorResponse;
  };

  /**
   * Change the UI when WSC session failed
   */
  var destroy = function() {
    wscSession = null;
    targetInput.get(0).disabled = true;
    messageInput.get(0).disabled = true;
    sendButton.get(0).disabled = true;
  };

  var sendMessage = function() {
    var target = targetInput.val().trim();
    var msg = messageInput.val();
    console.log("Prepare to Sent messaging message: " + msg);
    console.log("                               To: " + target);
    if (target == "") {
      targetInput.closest(".form-group").addClass("has-error").delay(2000).queue(function(){
        $(this).removeClass("has-error").dequeue();
      });
      targetInput.closest(".form-group").find(".help-block").show().delay(2000).queue(function(){
        $(this).hide().dequeue();
      });
    } else {
      if (target.indexOf("@") < 0) {
        target = target + "@example.com";
      }

      if (msg && msg != "") {
        var msgId = messaging.send(msg, target);
        console.log("Sent messaging message: " + msg);
        console.log("The sent message Id: " + msgId);
        appendMessage(wscSession.userName, msg);
      } else {
        console.log("Please input message.");
      }
    }
  };

  /**
   * Handle enter key, if the Key is "Enter" then send out the input message.
   */
  targetInput.keypress(function (e) {
    if (e.which == 13) {
      sendMessage();
    }
  });

  /**
   * Handle enter key, if the Key is "Enter" then send out the input message.
   */
  messageInput.keypress(function (e) {
    if (e.which == 13) {
      sendMessage();
    }
  });

  function onNewMessage(chatMessage, extHeaders) {
    console.log("Got messaging message: " + chatMessage.content);
    var
      initiator = chatMessage.initiator,
      msg = chatMessage.content;

    if (extHeaders) {
      console.log("extHeader: " + extHeaders);
    }

    messaging.accept(chatMessage);
    appendMessage(initiator, msg);
  }
  
  function onSuccessResponse(message, extHeaders) {
    var content = message.content;
    console.log("Send message \"" + content + "\" succeed.");
  
    if (extHeaders) {
      console.log("extHeader: " + extHeaders);
    }
  }

  function onErrorResponse(failureMsg, code, reason, extHeaders) {
    var content = failureMsg.content;
    console.log("Send message \"" + content + "\" failed with code: ", code, " and reason: ", reason);

    $("#messagingWarningMsg").text("Message sending failed with code: " + code
      + " and reason: " + reason);
    $("#messagingWarningDiv").show();
    $("#sipTarget, #msgField").on("change.messagingFailed", function() {
      $("#messagingWarningDiv").hide();
      $("#sipTarget, #msgField").off("change.messagingFailed");
    });
  }

  var appendMessage = function (user, msg) {
    console.log("update messaging History: user = " + user);
    console.log("update messaging History: msg = " + msg);
    var isMe = wscSession.getUserName() == user,
    msgDiv = messageTemplate.clone().removeClass('messaging-template').addClass(isMe ? 'msg-out' : 'msg-in').appendTo(messageBox).show();
    console.log("update messaging History: isMe = " + isMe);
    msgDiv.find('span.time-user').text('(' + new Date().toLocaleTimeString() + ') ' + (isMe ? 'Me' : user) + ': ');
    msgDiv.find('span.msg').css("white-space", "pre").text(msg);
    messageBox.get(0).scrollTop = messageBox.get(0).scrollHeight + 20;
  };
  
  /////////////////////////////

  return {
    init: init,
    destroy: destroy
  };
});