define(['jquery', 'msrpSettings'], function ($, msrpSettings) {

  var wscSession = null, // session instance
      chatPackage = null,// instance of wsc.ChatPackage
      fileTransferPackage = null,// instance of wsc.FileTransferPackage
      cachedFileData = {},// store file data, key is file transfer ID.
      targetInput = $('input.msrp-target'), // input of target
      chatButton = $('button.msrp-chat-btn'),
      chatTemplate = $('.msrp-chat-template'),// chat template div used to create chat div.
      isFileReceiver = false, // flag to show if I am file receiver
      chats = $('.chats'); // the container div for all chat panel div.


  /********************************************************************************************************************
   * Business logic section BEGIN. Please put UI related code in UI section
   */

  /**
   * Initialization method for Chat/FileTransfer, this method will be exposed.
   * 1. create a wsc.ChatPackage object
   * 2. set onIncomingChat to the wsc.ChatPackage object for incoming chat request
   * 3. create a wsc.FileTransferPackage object
   * 4. set onFileTransfer to the wsc.FileTransferPackage object for incoming file transfer request
   */
  var init = function(session) {
    msrpSettings.init();
    wscSession = session;
    chatPackage = new wsc.ChatPackage(wscSession);
    chatPackage.onIncomingChat = incomingChatHandler;
    fileTransferPackage = new wsc.FileTransferPackage(wscSession);
    fileTransferPackage.onFileTransfer = incomingFileTransferHandler;
    msrpInited(); // update UI
  };

  /**
   * Change the UI when WSC session failed
   * TODO: how if WSC session restored?
   */
  var destroy = function() {
    wscSession = null;
    msrpDestroied();
  };

  ////// business for MSRP chat
  /**
   * Create a chat, bind event handlers to it.
   * @param target the other peer to chat.
   * @param chatDiv the panel to show the chat
   * @returns {wsc.Chat}
   */
  function startNewChat(target, chatDiv) {
    var chat;
    chat = chatPackage.createChat(target);
    bindEventHandlerForChat(chat);
    attachChatDiv(chat, chatDiv);
    chat.start(getChatConfig());
    return chat;
  }

  function endChat(chat) {
    if (chat) {
      chat.end();
    }
  }

  /**
   * Handler for incoming chat request
   * @param chat wsc.Chat instance passed by JS SDK
   */
  function incomingChatHandler(chat) {
    bindEventHandlerForChat(chat);
    var chatDiv = prepareForIncomingChat(chat);
    attachChatDiv(chat, chatDiv);
    chat.accept(getChatConfig()); // accept the incoming chat request by default. Without determination of user.
  }

  /**
   * Send out a message
   * @param chat the chat which want to send out message
   * @param msg the message
   */
  function sendMessage(chat, msg) {
    var chatMessage;
    if ( msrpSettings.getAcceptType() === 'message/cpim') {
      // Although this is not a valid MSRP message, this is to interworking with
      // Boghe RCS Client, which only support this format message!!!
      var cpim = "Subject: test\r\n\r\n" +
          "Content-Type: text/plain\r\n\r\n" +
          "From: " + chat.session.getUserName() +
          "\r\n\r\n" + msg;
      chatMessage = {
        contentType : 'message/cpim',
        content : cpim
      };
    } else {
      chatMessage = {
        contentType: 'text/plain',
        content: msg
      };
    }
    chat.send(chatMessage);
  }

  function bindEventHandlerForChat(chat) {
    chat.setSecure(msrpSettings.isSecure());
    chat.onStateChange = chatStateChangeHandler.bind(null, chat);
    chat.onConnectionStateChange = chatConnectionStateChangeHandler.bind(null, chat);
    chat.onChatMessage = chatMessageHandler.bind(null, chat);
    chat.onMessageSendSuccess = messageSendSuccessHandler;
    chat.onMessageSendFailure = messageSendFailureHandler;
    chat.onMessageTyping = messageTypingHandler.bind(null, chat); // pass chat as argument
    chat.onMessageTypingStop = messageTypingStopHandler.bind(null, chat);
  }

  /**
   * Handler for chat state change
   * @param chat the chat whose state changes
   * @param callState current state
   */
  function chatStateChangeHandler(chat, callState) {
    console.log("Chat state: " + callState.state);
    switch (callState.state) {
      case wsc.CALLSTATE.STARTED :
      case wsc.CALLSTATE.RESPONDED :
        break;
      case wsc.CALLSTATE.ESTABLISHED :
        break;
      case wsc.CALLSTATE.ENDED :
      case wsc.CALLSTATE.FAILED:
        chatFailed(chat);
        break;
    }
  }

  /**
   * Handler for chat connection state change
   * @param chat
   * @param state
   */
  function chatConnectionStateChangeHandler(chat, state) {
    console.log("Chat connection state: " + state.state);
    switch (state.state) {
      case wsc.ConnectionStateEnum.CLOSED :
      case wsc.ConnectionStateEnum.ERROR :
        chatFailed(chat);
        break;
    }
  }

  /**
   * Handler when receiving a chat message
   * @param chat
   * @param msg
   */
  function chatMessageHandler(chat, msg) {
    console.log("Got chat message: " + msg.content);
    var content = msg.content,
        textContent = null,
        cType = msg.contentType,
        sender = null;
    if (cType == 'message/cpim') {
      sender = extractText(content, "From:", "\r\n");
      textContent = content.substring(content.indexOf("Content-Type"));
      var startIndex = textContent.indexOf("\r\n\r\n");
      textContent = textContent.substring(startIndex);
      if (textContent.indexOf("\r\n\r\n") == 0) {
        textContent.replace("\r\n\r\n", "");
      }
    } else { // text/plain
      textContent = content;
    }
    // 1st, we try get initiator from MSRP message, if not,
    // we try get it from chat..
    if (!sender) {
      sender = getTheOtherPeer(chat)
    }
    displayMessage(sender, textContent, chat);
  }

  function messageSendSuccessHandler(msgId) {
    console.log("Send message success. msg ID: ", msgId);
  }

  function messageSendFailureHandler(msgId) {
    console.log("Send message failure. msg ID: ", msgId);
  }

  function messageTypingHandler(chat) {
    console.log(getTheOtherPeer(chat) + " is typing...");
  }

  function messageTypingStopHandler(chat) {
    console.log(getTheOtherPeer(chat) + " has stopped typing");
  }

  ////// business for file transfers
  /**
   * Create a file transfer, bind event handlers to it.
   * @param target the other peer to send file.
   * @param ftDiv the panel to show the file transfer
   * @returns {wsc.FileTransfer}
   */
  function startNewFileTransfer(target, fileConfigs, ftDiv) {
    var fileTransfer;
    fileTransfer = fileTransferPackage.createFileTransfer(target);
    bindEventHandlerForFileTransfer(fileTransfer);
    attachFileTransferDiv(fileTransfer, ftDiv);
    fileTransfer.start(fileConfigs);
    isFileReceiver = false;
    return fileTransfer;
  }

  /**
   * Accept the file transfer request
   * @param ft
   */
  function acceptFileTransfer(ft) {
    if (ft) {
      ft.accept();
    }
  }

  /**
   * Decline the file transfer request
   * @param ft
   */
  function declineFileTransfer(ft) {
    if (ft) {
      ft.decline();
    }
  }

  /**
   * Abort the file transfer
   * @param ft
   */
  function abortFileTransfer(ft) {
    if (ft && ft.getState().state === wsc.CALLSTATE.ESTABLISHED) {
      try {
        ft.abort();
      } catch (e) {
        console.log("Error happens when abort the file transfer, ", e);
      }
    }
  }

  /**
   * Handler for incoming file transfer request
   * @param fileTransfer
   */
  function incomingFileTransferHandler(fileTransfer) {
    bindEventHandlerForFileTransfer(fileTransfer);
    var ftDiv = prepareForIncomingFileTransfer(fileTransfer);
    attachFileTransferDiv(fileTransfer, ftDiv);
    isFileReceiver = true;
  }

  /**
   * Bind event handlers for the file transfer
   * @param fileTransfer
   */
  function bindEventHandlerForFileTransfer(fileTransfer) {
    fileTransfer.setSecure(msrpSettings.isSecure());
    if (msrpSettings.getChunkSize() != "") {
      fileTransfer.setChunkSize(msrpSettings.getChunkSize());
    }
    fileTransfer.onStateChange = ftStateChangeHandler.bind(null, fileTransfer);
    fileTransfer.onConnectionStateChange = ftConnectionStateChangeHandler;
    fileTransfer.onFileData = fileDataHandler.bind(null, fileTransfer);
    fileTransfer.onProgress = progressHandler.bind(null, fileTransfer);
    fileTransfer.onFileTransferSuccess = fileTransferSuccessHandler.bind(null, fileTransfer);
    fileTransfer.onFileTransferFailure = fileTransferFailureHandler;
  }

  /**
   * Handler for file transfer state changes
   * @param fileTransfer
   * @param fileTransferState
   */
  function ftStateChangeHandler(fileTransfer, fileTransferState) {
    switch (fileTransferState.state) {
      case wsc.CALLSTATE.ESTABLISHED :
        fileTransferEstablished(fileTransfer);
        break;
      case wsc.CALLSTATE.RESPONDED :
        break;
      case wsc.CALLSTATE.ENDED :
      case wsc.CALLSTATE.FAILED:
        fileTransferEnded(fileTransfer, fileTransferState.status.code);
        break;
    }
  }

  function ftConnectionStateChangeHandler(sessionState) {
    console.log("FileTransfer Session" + sessionState.fileTransferId + " state: " + sessionState.state);
  }

  /**
   * Handler for receiving file data.
   * @param fileTransfer
   * @param data
   */
  function fileDataHandler(fileTransfer, data) {
    var fileTransferId = data.fileTransferId;
    console.log("Got file data, fileTransferId: " +
        fileTransferId + ", range: " + JSON.stringify(data.range));
    cachedFileData[fileTransferId] = cachedFileData[fileTransferId] || [];
    if (data.content instanceof String) {
      cachedFileData[fileTransferId].push(data.content);
    } else {
      cachedFileData[fileTransferId] = cachedFileData[fileTransferId].concat(data.content);
    }
  }

  /**
   * Handler for progress event.
   * @param fileTransfer
   * @param data
   */
  function progressHandler(fileTransfer, data) {
    updateProgressBar(fileTransfer, data);
  }

  function fileTransferSuccessHandler(fileTransfer, fileTransferId) {
    console.log("File transfer success: " + fileTransferId);
    var blob, fileConfigs = fileTransfer.getFileConfigs(), fileName = null,
      ftDiv = getFileTransferDiv(fileTransfer),
      count, fileConfig;
    for (var i = 0; i < fileConfigs.length; i++) {
      if (fileConfigs[i].props.fileTransferId == fileTransferId) {
        fileConfig = fileConfigs[i];
        count = (ftDiv.data('isFtComplete') || 0) + 1;
        ftDiv.data('isFtComplete', count);
        if (count === fileTransfer.getFileConfigs().length) {
          ftDiv.find('div.cancel').text("Complete.");
        }
        break;
      }
    }
    if (isFileReceiver) {
      fileName = fileConfig.props.name;
      if (fileConfig.props.size === 0) {
        // for empty file.
        blob = new Blob();
      } else {
        blob = new Blob(cachedFileData[fileTransferId]);
      }
      saveFile(blob, fileName);
    }
    if (fileConfig.props.size == 0) {
      updateProgressBar(fileTransfer, {range: {start: 1, end: 0, total: 0}, fileTransferId: fileTransferId});
    }
  }

  function fileTransferFailureHandler(fileTransferId) {
    console.log("File transfer failure: " + fileTransferId);
  }

  ////// utility functions
  /**
   * Get chat config object
   * @returns {{acceptTypes: *[], selfMaxSize}}
   */
  function getChatConfig() {
    return {acceptTypes: [msrpSettings.getAcceptType()], selfMaxSize: msrpSettings.getChunkSize()};
  }

  /**
   * Extract string between strStart and strFinish.
   * @param strToParse
   * @param strStart
   * @param strFinish
   * @returns {*}
   */
  function extractText(strToParse, strStart, strFinish) {
    var result = strToParse.match(strStart + "(.*?)" + strFinish);
    if (result && result.length && result.length >1) {
      return result[1];
    }
    return null;
  }

  // class name does not support character @ and ., and convert them to specific string.
  // @ -> wsc
  // . -> csw
  function username2ClassName(username) {
    var className = username.replace('@', 'wsc');
    className = className.replace('.', 'csw');
    return className;
  }
  /*
   * Business logic section END. Please put UI related code in UI section
   ********************************************************************************************************************/


  /********************************************************************************************************************
   * UI section BEGIN. Please put Business logic related code in Business logic section
   */

  /**
   * Prepare UI when msrp is destroied.
   */
  function msrpDestroied() {
    targetInput.get(0).disabled = true;
    chatButton.get(0).disabled = true;
    chats.find('.msrp-message').attr('disabled',true);
    chats.find('input[type=file]').attr('disabled',true);
  }

  /**
   * Prepare UI when msrp is inited.
   * Bind event handlers, and update UI, etc.
   */
  function msrpInited() {
    ////////////// Bind event handler to UI components: buttons, etc.. ///////////

    // click the chat button
    chatButton.on('click', function() {
      chatButtonClicked();
    });

    // "chats" is the outer div block for all MSRP chats and file transfer.
    // attach event handler to the UI components
    chats
      .on('keypress', 'input.msrp-message', function (e) { // keypress for message input
        if (e.which == 13) { // Enter key to send a mesage out.
          var user = wscSession.getUserName(),
            msg = $(this).val(),
            chatDiv = $(this).closest('.msrp-chat-div'),
            chat = chatDiv.data('chat');

          if (chat) {
            sendMessage(chat, msg);
          } else { // the chat is closed by the other peer, but the chat panel still exist.
            chat = startNewChat(chatDiv.data('peer'), chatDiv);
            chatDiv.data('chat', chat);
            chatDiv.find('.msrp-chat-with').text("Chat to: " + chatDiv.data('peer'));
            setTimeout(function () {
              sendMessage(chat, msg);
            }, 300);
          }
          displayMessage(user, msg, chat);
          $(this).val(''); // empty the message input
        }
      })
      .on('click', '.glyphicon-remove', function (e) { // click the remove icon of chat panel
        var chatDiv = $(this).closest('.msrp-chat-div'),
          chat = chatDiv.data('chat');
        //end the chat
        endChat(chat);
        // abort all the file transfer.
        chatDiv.find('.ft-in, .ft-out').each(function () {
          var ft = $(this).data('ft');
          abortFileTransfer(ft);
        });
        // remove the panel of the chat
        chatDiv.remove();
      })
      .on('change', 'input[type=file]', function () { // select file for transfer (file button)
        var fBtn = $(this), selectedFiles = fBtn.prop('files'), i, file, fileTransfer, ftDiv, fileConfig = {},
          fileConfigs = [], chatDiv = fBtn.closest('.msrp-chat-div'), messageBox = chatDiv.find('.msrp-chat-box'),
          ftTemplate = messageBox.find('div.ft-template'),
          target = chatDiv.data('peer'), fileTplDiv, fileDiv, fileInfoDiv, fileTable;

        ftDiv = ftTemplate.clone().removeClass('ft-template').addClass('ft-out')
          .appendTo(messageBox).show();
        ftDiv.find('span.time-user').text('(' + new Date().toLocaleTimeString() + ') ' + 'Me: ');
        fileInfoDiv = ftDiv.find('div.ft-info');
        fileInfoDiv.find('p.title').text('Sending files.');
        fileTable = fileInfoDiv.find('.table-msrp');
        fileTplDiv = fileTable.find('.file-tpl');
        for (i = 0; file = selectedFiles[i]; i++) {
          fileDiv = fileTplDiv.clone().removeClass('file-tpl').addClass('file').appendTo(fileTable).show();
          fileDiv.find('.file-name').text(file.name);
          fileDiv.find('.file-size').text((file.size / 1024).toFixed(2));
          fileConfig = {};
          fileConfig.file = file;
          fileConfig.props = null;
          fileConfigs.push(fileConfig);
        }

        fileTransfer = startNewFileTransfer(target, fileConfigs, ftDiv);
        ftDiv.data('ft', fileTransfer);
        messageBox.get(0).scrollTop = messageBox.get(0).scrollHeight + 20;

        fBtn.wrap(document.createElement('form')).parent().trigger('reset').children().unwrap();
        fBtn.closest('.btn').attr("disabled", true);
      })
      .on('click', 'a.ft-accept', function (e) { // click accept link when getting a file transfer request
        var ftDiv = $(this).closest('div.ft-in'),
          fileTransfer = ftDiv.data('ft');
        acceptFileTransfer(fileTransfer);
        ftDiv.find('div.operations').text("Accepted.");
        ftDiv.find('div.ft-progress').show();
      })
      .on('click', 'a.ft-decline', function (e) { // click decline link when getting a file transfer request
        var link = $(this), ftDiv = link.closest('div.ft-in'),
          fileTransfer = ftDiv.data('ft');
        declineFileTransfer(fileTransfer);
        ftDiv.find('div.operations').text("Declined.");
      })
      .on('click', 'a.ft-cancel', function (e) { // click cancel button after sending a file transfer request
        var link = $(this), ftDiv = link.closest('div.ft-in, div.ft-out'),
          fileTransfer = ftDiv.data('ft');
        abortFileTransfer(fileTransfer);
        ftDiv.find('div.cancel').text("Cancelled.");
      });

    // enable target input
    targetInput.get(0).disabled = false;
    // enable chat button
    chatButton.get(0).disabled = false;
  }

  /**
   * Handler when chat button is clicked to start a chat.
   */
  function chatButtonClicked() {
    var target = targetInput.val().trim(), wscChat, chatDiv;
    if (target == "") { // notify user that target is empty.
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
      if ($('.' + username2ClassName(target)).length == 0) { // create a panel and start a new chat.
        chatDiv = chatTemplate.clone().removeClass('msrp-chat-template').addClass('msrp-chat-div')
            .addClass(username2ClassName(target)).appendTo(chats).show();
        wscChat = startNewChat(target, chatDiv);
        chatDiv.data('chat', wscChat).data('peer', target);
        chatDiv.find('.msrp-chat-with').text("Chat to: " + target);
        chatDiv.find('.msrp-message').focus();
      } else { // if the panel for given target exists, focus on it
        $('.' + username2ClassName(target)).find('.msrp-message').focus();
      }
    }
  };

  /**
   * Update UI when get an incoming chat request.
   * @param chat
   * @returns {*}
   */
  function prepareForIncomingChat(chat) {
    var from = chat.getInitiator(), chatDiv;
    if ($('.' + username2ClassName(from)).length == 0) {
      chatDiv = chatTemplate.clone().removeClass('msrp-chat-template')
          .addClass('msrp-chat-div').addClass(username2ClassName(from)).appendTo(chats).show();
      chatDiv.data('chat', chat).data('peer', from);
      chatDiv.find('.msrp-chat-with').text("Chat from: " + from);
    } else {
      $('.' + username2ClassName(from)).data('chat', chat);
      chatDiv = $('.' + username2ClassName(from)).eq(0);
    }

    return chatDiv;
  }

  /**
   * When chat failed, clear it from chat div.
   * @param chat
   */
  function chatFailed(chat) {
    getChatDiv(chat).data('chat', null);
  }

  /**
   * Display message in the message box
   * @param user
   * @param msg
   * @param chat
   */
  function displayMessage(user, msg, chat) {
    var isMe = wscSession.getUserName() == user,
        chatDiv = getChatDiv(chat),
        messageTemplate = chatDiv.find('.msg-template'),
        messageBox = chatDiv.find('.msrp-chat-box'),
        msgDiv = messageTemplate.clone().removeClass('msg-template').addClass(isMe ? 'msg-out' : 'msg-in').appendTo(messageBox).show();
    msg = msg.replace("<", "&lt;");
    msg = msg.replace(">", "&gt;");
    msgDiv.find('span.time-user').text('(' + new Date().toLocaleTimeString() + ') ' + (isMe ? 'Me' : user) + ': ');
    msgDiv.find('span.msg').text(msg);
    messageBox.get(0).scrollTop = messageBox.get(0).scrollHeight + 20;
  }

  /**
   * Get the other peer for the chat.
   * @param chat
   */
  function getTheOtherPeer(chat) {
    return getChatDiv(chat).data('peer');
  }

  /**
   * Get the chat div element of the chat.
   * @param chat
   * @returns {*}
   */
  function getChatDiv(chat) {
    return chat.__wsc_sample_chatDiv__;
  }

  /**
   * Attach the div element to the chat.
   * @param chat
   * @param chatDiv
   */
  function attachChatDiv(chat, chatDiv) {
    chat.__wsc_sample_chatDiv__ = chatDiv;
  }

  ////// file transfer
  /**
   * Get div element of the file transfer object
   * @param fileTransfer
   * @returns {*}
   */
  function getFileTransferDiv(fileTransfer) {
    return fileTransfer.__wsc_sample_fileTransferDiv__;
  }

  /**
   * Attach the div element to the file transfer object
   * @param fileTransfer
   * @param fileTransferDiv
   */
  function attachFileTransferDiv(fileTransfer, fileTransferDiv) {
    fileTransfer.__wsc_sample_fileTransferDiv__ = fileTransferDiv;
  }

  /**
   * Prepare the UI for the incoming file transfer
   * @param fileTransfer
   * @returns {*}
   */
  function prepareForIncomingFileTransfer(fileTransfer) {
    var from = fileTransfer.getInitiator(), chatDiv, ftTemplate, ftDiv, i, messageBox, fileButton,
        fileConfigs = fileTransfer.getFileConfigs(), fileInfoDiv, filetplDiv, fileDiv, fileConfig, fileTable;
    if ($('.' + username2ClassName(from)).length == 0) {
      chatDiv = chatTemplate.clone().removeClass('msrp-chat-template')
          .addClass('msrp-chat-div').addClass(username2ClassName(from)).appendTo(chats).show();
      chatDiv.data('peer', from);
      chatDiv.find('.msrp-chat-with').text("Chat from: " + from);
    } else {
      chatDiv = $('.' + username2ClassName(from)).eq(0);
    }

    fileButton = chatDiv.find('input[type=file]');
    messageBox = chatDiv.find('.msrp-chat-box');
    ftTemplate = chatDiv.find('.ft-template');
    ftDiv = ftTemplate.clone().removeClass('ft-template').addClass('ft-in')
        .appendTo(messageBox).show().data('ft', fileTransfer);
    ftDiv.find('span.time-user').text('(' + new Date().toLocaleTimeString() + ') ' + fileTransfer.getInitiator() + ': ');

    fileInfoDiv = ftDiv.find('div.ft-info');
    fileInfoDiv.find('p.title').text('Wants to send you files.');
    fileTable = fileInfoDiv.find('.table-msrp');
    filetplDiv = fileTable.find('.file-tpl');
    for(i = 0; fileConfig = fileConfigs[i]; i++) {
      fileDiv = filetplDiv.clone().removeClass('file-tpl').addClass('file').appendTo(fileTable).show();
      fileDiv.find('.file-name').text(fileConfig.props.name);
      fileDiv.find('.file-size').text((fileConfig.props.size / 1024).toFixed(2));
    }

    ftDiv.find('div.operations').show();
    messageBox.get(0).scrollTop = messageBox.get(0).scrollHeight + 20;
    fileButton.closest('.btn').attr("disabled", true);

    return ftDiv;
  }

  /**
   * Update the UI when the file transfer is established.
   * @param fileTransfer
   */
  function fileTransferEstablished(fileTransfer) {
    var ftDiv = getFileTransferDiv(fileTransfer),
        chatDiv = ftDiv.closest('.msrp-chat-div'),
        fileButton = chatDiv.find('input[type=file]'),
        fileConfigs = fileTransfer.getFileConfigs(),
        fileConfig,
        ftProgress = ftDiv.find('div.ft-progress'),
        progressDiv = ftProgress.find('.progress'),
        theProgress,
        fileDivs = ftDiv.find('.file'),
        progressTrTpl = ftDiv.find(".progress-tr-tpl"),
        progressTr,
        messageBox = ftDiv.closest('.msrp-chat-box');

    for(var i = 0; fileConfig = fileConfigs[i]; i++) {
      progressTr = progressTrTpl.clone().insertAfter(fileDivs[i]).removeClass('progress-tr-tpl').show();
      theProgress = progressDiv.clone().addClass(fileConfig.props.fileTransferId).appendTo(progressTr.find('.progress-td')).show();
    }
    ftDiv.find('div.operations').hide();
    ftProgress.show();
    fileButton.closest('.btn').attr("disabled", false);
    messageBox.get(0).scrollTop = messageBox.get(0).scrollHeight + 20;
  }

  /**
   * Update UI when file transfer is ended.
   * @param fileTransfer
   * @param code
   */
  function fileTransferEnded(fileTransfer, code) {
    var ftDiv = getFileTransferDiv(fileTransfer),
        chatDiv = ftDiv.closest('.msrp-chat-div'),
        fileButton = chatDiv.find('input[type=file]'),
        count;

    if (code == 603) {
      ftDiv.find('div.operations').show().text("Request declined.");
    } else {
      if (ftDiv.find('div.ft-progress').is(":hidden")) {
        ftDiv.find('div.operations').text("Cancelled.");
      } else {
        if (ftDiv.data('isFtComplete') !== fileTransfer.getFileConfigs().length) {
          ftDiv.find('div.cancel').text("Aborted.");
        }
        ftDiv.find('div.progress-bar').removeClass('active');
;      }
    }
    fileButton.closest('.btn').attr("disabled", false);
  }

  /**
   * Save the received file.
   * @param blob
   * @param fileName
   */
  function saveFile(blob, fileName) {
    blob.url = URL.createObjectURL(blob);
    if (fileName) {
      console.log("Save file " + fileName);
      var hyperlink = document.createElement('a');
      hyperlink.href = blob.url;
      hyperlink.target = '_blank';
      hyperlink.download = fileName || blob.url;

      var mouseEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      hyperlink.dispatchEvent(mouseEvent);
    }
  }

  /**
   * Update progress bar of the file transfer.
   * @param fileTransfer
   * @param data
   */
  function updateProgressBar(fileTransfer, data) {
    var progressPercent,
        fileTransferId = data.fileTransferId,
        ftDiv = getFileTransferDiv(fileTransfer),
        progressDiv = ftDiv.find('.' + fileTransferId);
    if (data.range.total != 0) {
      progressPercent = Math.ceil(data.range.end / data.range.total * 100);
    } else {
      progressPercent = 100;
    }
    progressDiv.find('div.progress-bar').attr('aria-valuenow', progressPercent).css('width', progressPercent + '%');
    progressDiv.find('div.progress span.sr-only').text(progressPercent + "% Complete");
    if (progressPercent === 100) {
      progressDiv.find('div.progress-bar').removeClass('active');

    }
  }
  /*
   * UI section END. Please put Business logic related code in Business logic section
   ********************************************************************************************************************/

  return {
    init: init,
    destroy: destroy
  };
});