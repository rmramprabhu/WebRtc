define(
  [ 'jquery', 'callController' ],
  function($, callController) {

    function CallUI() {
      /**
       * The session between browser and WSC SE server
       * @type {null}
       */
      var wscSession = null;

      /**
       * Bind the UI event Handler for handling UI events received by the sample
       */
      function bindUIEventHandler() {
        $(".notifications") // for all notification pop-up windows
          .on("click", ".call-accept", function () { // click the accept button for the incoming call
            var alertElem = $(this).closest(".alert"),
              call = alertElem.data("call");
            callController.accept(call, alertElem.data("callConfig"));
            alertElem.remove();
          })
          .on("click", ".call-decline", function () { // click the decline button for the incoming call
            var alertElem = $(this).closest(".alert");
            callController.reject(alertElem.data("call"));
            alertElem.remove();
          });

        $(".calls") // for all call panels
          .on("click", ".btn-cancel, .btn-hangup", function () { // click cancel button or hang up button
            var callElem = $(this).closest(".call-window"),
              call = callElem.data("call");
            callController.hangUp(call.subSessionId);
            $(".btn-screenshare").hide();
            $("#clientVideo").hide();
            callElem.remove();
          })
          .on("click", ".btn-removeVideo", function () { // click audio only button
            var callElem = $(this).closest(".call-window"),
              call = callElem.data("call");
            disableUpdateRelatedButtons(call);
            callController.removeVideo(call.subSessionId);
          })
          .on("click", ".btn-addVideo", function () { // click add video button
            var callElem = $(this).closest(".call-window"),
              call = callElem.data("call");
            disableUpdateRelatedButtons(call);
            callController.addVideo(call.subSessionId);
          })
          .on("click", ".btn-mute", function () { // click mute button
            var call = $(this).closest(".call-window").data("call");
            mute(call, true);
          })
          .on("click", ".btn-unmute", function () { // click un-mute button
            var call = $(this).closest(".call-window").data("call");
            mute(call, false);
          })
          .on("click", ".btn-addAudio", function () { // click add audio button
            var call = $(this).closest(".call-window").data("call");
            disableUpdateRelatedButtons(call);
            callController.addAudio(call.subSessionId);
          })
          .on("click", ".btn-addChat", function () { // click add chat button (chat through data channel)
            var call = $(this).closest(".call-window").data("call");
            disableUpdateRelatedButtons(call);
            callController.addChat(call.subSessionId);
          })
          
          .on("click", ".btn-sendFile", function () { // click add chat button (chat through data channel)
            var call = $(this).closest(".call-window").data("call");
            
            document.querySelector('input[type=file]').onchange = function() {
                var file = this.files[0];
            };
            //disableUpdateRelatedButtons(call);
            //callController.addChat(call.subSessionId);
          })
          
//          .on("click", ".btn-removeChat", function () { // click remove chat button
//            var call = $(this).closest(".call-window").data("call");
//            disableUpdateRelatedButtons(call);
//            callController.removeChat(call.subSessionId);
//          });

        .on("click", ".btn-removeChat", function () { // click remove chat button
            var call = $(this).closest(".call-window").data("call");
            disableUpdateRelatedButtons(call);
            
            //this will trigger the plugin, to receive call back to share screen share pop-up.
            window.postMessage({ type: 'OCWSC_REQUEST', text: 'start' }, '*');
            
            //share start
        	/*Registering screen sharing extension. */
        	window.addEventListener('message', function (event) {
        	        

        	        // content-script will send a 'OCWSC_PING' msg if extension is installed
        	        if (event.data.type && (event.data.type === 'OCWSC_PING')) {
        	        alert("pinged");
        	        }

        	        

        	        // user chose a stream
        	        if (event.data.type && (event.data.type === 'OCWSC_DIALOG_SUCCESS')) {
        	        	
        	        	
        	            
                        	
                           
        	        	$.getScript("https://cdn.webrtc-experiment.com/getScreenId.js", function(){
        	        		
        	        	
                            getScreenId(function(error, sourceId, screen_constraints) {
                                // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
                                // sourceId == null || 'string' || 'firefox'
                                // getUserMedia(screen_constraints, onSuccess, onFailure);
                            	//alert("--sourceId--" + sourceId);
                                //alert("--screen_constraints--" + screen_constraints);     
                                navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                                navigator.getUserMedia(screen_constraints, function(stream) {
                                	
                                	
                                	
                                	
                                    $.get('agent.html',function(html){
                                    	alert("--stream--" + stream);  
                                        $(html).find('clientVideo').attr("src", URL.createObjectURL(stream));
                                     });
                                	
                                	  //$("#video").find("#tv_main_channel").attr("src", URL.createObjectURL(stream))
                                	//$("#clientVideo").attr("src", URL.createObjectURL(stream))
                                    //document.getElementById("clientVideo").src = URL.createObjectURL(stream);
                                    
                                    stream.onended = function() {
                                        document.getElementById("clientVideo").src = null;
                                        //document.getElementById('capture-screen').disabled = false;
                                    };
                                }, function(error) {
                                    alert(JSON.stringify(error, null, '\t'));
                                });
                            });
        	        	});
              
        	        	
        	        	
        	        	
        	        	
        	        	
        	        	
//        	        	var onSuccessStream = function(localMediaStream) {
//        	                localVideoStream = localMediaStream;
//        	    			
//        	    			onLocalMediaSuccess(localMediaStream);			
//        	            };
//        	            
//        	            function onLocalMediaError(error) {
//        	                console.log("On local desktop sharing fail");
//        	            }
//        	            
//        	        	var mediaOptions = {
//        	                    audio : true,
//        	                    video : true,
//        	                    data  : true,
//        	                    dcConfig : [{"label":"chameleonDataChannel", "reliable" : true }]
//        	                };
//        	        	
//        	            if (event.data.streamId) {
//        	                console.log("Screen share on..."+event.data.streamId);
//        	                mediaOptions = {
//        	                    audio: false,
//        	                    video: {
//        	                        mandatory: {
//        	                            chromeMediaSource: 'desktop',
//        	                            //chromeMediaSourceId: event.data.streamId,
//        	                            maxWidth: 1280,
//        	                            maxHeight: 720
//        	                        },
//        	                        optional: []
//        	                    },
//        	                    data  : true,
//        	                    dcConfig : [{"label":"chameleonDataChannel", "reliable" : true }]				
//        	                };
//        	        	//callController.screenShare(call.subSessionId)
//        	        	
//        	        	//alert("success");
//        	            }
//        	            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
//
//
//        	            console.log("Retrieving local webcam by getUserMedia()"+JSON.stringify(mediaOptions));
//        	            navigator.getUserMedia(mediaOptions, onSuccessStream, onLocalMediaError);
//        	            console.log("After getUserMedia--"+JSON.stringify(mediaOptions));
//        	            //document.getElementById("clientVideo").src = window.URL.createObjectURL(JSON.stringify(mediaOptions));
//        	            //document.querySelector('video').src = window.URL.createObjectURL(onSuccessStream);
//        	            //attachMediaStream(document.getElementById(localVideoId), stream);
//        	            document.querySelector('video').src = window.URL.createObjectURL(JSON.stringify(mediaOptions));
        	            //callController.addVideo(call.subSessionId);
        	            //callController.screenShare(call.subSessionId)
        	        }

        	        // user clicked on 'cancel' in choose media dialog
        	        if (event.data.type && (event.data.type === 'OCWSC_DIALOG_CANCEL')) {
        	            chameleon.isdidToggleScreenSharingMode = false;
        	            chameleon.isScreenSharingMode = !chameleon.isScreenSharingMode;
        	            console.log('User cancelled!');
        	        }
        	});
        	//share end 	 


          });

        // click audio call button to start an audio call
        $(".btnStartAudio").off('click').click(function () {
          var target = getTarget();
          if (target) {
            callController.startVoiceCall(target, initCall, false, callErrorHandler);
          }
        });

        // click video call button to start a video call
        $(".btnStartVideo").off('click').click(function () {
          var target = getTarget();
          if (target) {
            callController.startVideoCall(target, initCall, false, callErrorHandler);
          }
        });

        // click datachannel chat button to start a datachannel chat
        $(".btnStartDatachannel").off('click').click(function () {
          var target = getTarget();
          if (target) {
        	callController.startDataChannel(target, initCall, callErrorHandler);
        	connectToAgent(target);
          }
        });

        // press enter key to start a video call for testing convenience
        $("#callee").off("keypress").on("keypress", function(e) {
          if (e.which == 13) {
            $(".btnStartVideo:visible").trigger("click");
            return false;
          }
        });
      }

      /**
       * Initialize page elements.
       * @param session
       */
      this.initCallUI = function (session) {
        bindUIEventHandler();
        wscSession = session;
        callController.init(wscSession, onIncomingCall, initCall, updateCallUI);
      }; // End-of-this.initCallUI

      /**
       * fetch the target information for a call
       */
      function getTarget() {
    	  var callee ="";
    	  
    	  var questionType = $("#questionType").val().trim();
    	  //jQuery.ajaxSetup({async:false});
    	    $.ajax({
    	        url: 'https://13.63.249.131:7002/SSACallCenter/mvc/webRtc/getavailableagent/' + questionType,
    	        type: 'GET',
    	        success: function (data) {
    	        	callee = data;
    	        },
    	        async:false,
    	        error: function () {
    	            //alert("error");
    	        }
    	        
    	    });
    	    
        if (!callee) {
          $("#callee").parent().addClass("has-error");
          $("#callee").attr("placeholder", "Please input call target");
          return null;
        }
        if (callee && callee.indexOf("@") < 0) {
          callee = callee + "@example.com";
        }
        if (callee === wscSession.getUserName()) {
          $("#makeCallWarningMsg").text("You cannot make a call to yourself.");
          $("#makeCallWarningDiv").show();
          $("#callee").on("change.callYourself", function() {
            $("#makeCallWarningDiv").hide();
            $("#callee").off("change.callYourself");
          });

          return null;
        }
        //alert('--callee--'+callee);
        return callee;
      } //End-of-function getTarget()
      
      function connectToAgent(callee){
    	  var username = $("#username").val().trim();
    	  alert('--username--'+username);
    	    $.ajax({
    	        url: 'https://13.63.249.131:7002/SSACallCenter/mvc/webRtc/connectagent/customerid/' + username + '/agentid/' + callee,
    	        type: 'GET',
    	        success: function (data) {
    	        	//alert(data);
    	        },
    	        async:false,
    	        error: function () {
    	            //alert("error");
    	        }
    	        
    	    });
      }
    	
      function audioCallforAgent() {
          var target = getTarget();
          if (target) {
            callController.startVideoCall(target, initCall, false, callErrorHandler);
          }
        }
       /**
       * This is a callback function to handle a incoming call. and show the call window.
       * @param call
       * @param callConfig
       */
      function onIncomingCall(call, callConfig) {
        if (call.callState.state == wsc.CALLSTATE.STARTED || call.callState.state == wsc.CALLSTATE.RESPONDED) {
          initCall(call);
        }

        var notifyElem = $(".call-notify-template").clone();
        notifyElem.removeClass("call-notify-template");
        notifyElem.addClass(callController.getCallId(call));

        var from = (wscSession.getUserName() == call.caller) ? call.callee : call.caller;
        notifyElem.children('.call-notify-header').text("From : " + from);

        var description;
        if (call.callState.state == wsc.CALLSTATE.STARTED || call.callState.state == wsc.CALLSTATE.RESPONDED) {
          description = "A new ";
        } else {
          description = "Update to ";
        }

        if (call.isUpdate) {
          description = "Update to ";
        }

        var callDesc = "";
        if (callConfig.videoConfig == wsc.MEDIADIRECTION.SENDRECV) {
          callDesc = "Video";
        }
        if (callConfig.audioConfig == wsc.MEDIADIRECTION.SENDRECV) {
          if (callDesc != "") callDesc += "/";
          callDesc += "Audio";
        }
        if (callConfig.dataChannelConfig) {
          if (callDesc != "") callDesc += "/";
          callDesc += "DataChannel";
        }
        description += callDesc;
        description += " call";

        notifyElem.children('.call-notify-desc').text(description);

        notifyElem.data("call", call);
        notifyElem.data("callConfig", callConfig);
        notifyElem.appendTo(".notifications").show();

      } // End-of-function onIncomingCall(call, callConfig)

      /**
       * This is a callback function to handle a invitation call. After the call is established, the function would be
       * invoked showing the call window, and registered the call's callback functions like onCallStateChange,
       * onMediaStreamEvent, onUpdate and onDataTransfer.
       * @param call
       */
      function initCall(call) {
        showCallWindow(call);

        call.onCallStateChange = callStateChangeHandler.bind(null, call);
        call.onMediaStreamEvent = mediaStreamEventHandler.bind(null, call);
        call.onUpdate = onIncomingCall.bind(null, call);
        call.onDataTransfer = dataTransferHandler.bind(null, call);
      } // End-of-function initCall(call)

      /**
       * Handler when error of the call happens.
       * @param error {wsc.ErrorInfo}
       */
      function callErrorHandler(error) {
        console.log("Error happens! ", this);
        if (this && this instanceof wsc.Call) {
          var callIdClass = "." + callController.getCallId(this);
          $(callIdClass + " .callWarningMsg").text(error.reason);
          $(callIdClass + " .callWarningDiv").show(100).delay(3000).hide(100);
        }
      }

      /**
       * Handler for call state changes
       * @param call the call whose state changes
       * @param callState
       */
      function callStateChangeHandler(call, callState) {
        var callIdClass = "." + callController.getCallId(call);
        switch (callState.state) {
          case wsc.CALLSTATE.UPDATE_FAILED:
            $(".notifications " + callIdClass).remove();
            enableUpdateRelatedButtons(call);
            break;
          case wsc.CALLSTATE.RESPONDED:
            break;
          case wsc.CALLSTATE.ESTABLISHED:
          case wsc.CALLSTATE.UPDATED:
            updateCallUI(call);
            break;
          case wsc.CALLSTATE.ENDED:
          case wsc.CALLSTATE.FAILED:
            callController.cleanup(call.subSessionId);
            $(callIdClass).remove();
            $(".notifications " + callIdClass).remove();
            if (callState.state === wsc.CALLSTATE.FAILED) {
              showWarningMessage(call, callState);
            }
            break;
        }
      }

      /**
       * Handler for media stream event of the call
       * @param call
       * @param mediaEvent
       * @param stream
       */
      function mediaStreamEventHandler(call, mediaEvent, stream) {
        var callIdClass = "." + callController.getCallId(call);
        if (mediaEvent == wsc.MEDIASTREAMEVENT.LOCAL_STREAM_ADDED) {
          if (stream.getVideoTracks().length > 0) {
            // attachMediaStream is defined in wsc-common.js
            var localVideo = $(callIdClass + " .localVideo");
            localVideo.prop("muted", true);
            attachMediaStream(localVideo.get(0), stream);
          } else if (stream.getAudioTracks().length > 0) {
            var localAudio = $(callIdClass + " .localAudio");
            localAudio.prop("muted", true);
            attachMediaStream(localAudio.get(0), stream);
          }
        } else if (mediaEvent == wsc.MEDIASTREAMEVENT.REMOTE_STREAM_ADDED) {
          if (stream.getVideoTracks().length > 0) {
            attachMediaStream($(callIdClass + " .remoteVideo").get(0), stream);
          } else if (stream.getAudioTracks().length > 0) {
            attachMediaStream($(callIdClass + " .remoteAudio").get(0), stream);
          }
        }
      }

      /**
       * Handler for data transfer event of the call
       * @param call
       * @param dataTransfer
       */
      function dataTransferHandler(call, dataTransfer) {
        dataTransfer.onOpen = dataTransferOpenHandler.bind(null, call, dataTransfer);
        dataTransfer.onError = function () {
          console.log("Data channel error");
        };
        dataTransfer.onClose = function () {
          console.log("Data channel closed");
        };
      } // End-of-call.onDataTransfer

      /**
       * Handler when data transfer is open
       * @param call
       * @param dataTransfer
       */
      function dataTransferOpenHandler(call, dataTransfer) {
        var receiver = dataTransfer.getReceiver(),
          callIdClass = "." + callController.getCallId(call);
        if (receiver) {
          receiver.onMessage = function (evt) {
            var user = (wscSession.getUserName() == call.caller) ? call.callee : call.caller;
            updateChatHistory(user, call, evt.data,false);
          };
        }
        if (!$(callIdClass + " .input-datachannel").data('keypress')) {
          $(callIdClass + " .input-datachannel").keypress(function (e) {
            if (e.which == 13) {
              var user = wscSession.getUserName();
              updateChatHistory(user,call, $(this).val(),true);
              dataTransfer.getSender().send($(this).val());
              $(this).val('');
            }
          });
          $(callIdClass + " .input-datachannel").data('keypress', 1);
        }
        $(".btnSend").unbind('click').click(function () {
          var user = wscSession.getUserName();
          updateChatHistory(user,call, $(callIdClass + " .input-datachannel").val(),true);
          dataTransfer.getSender().send($(callIdClass + " .input-datachannel").val());
          $(callIdClass + " .input-datachannel").val('');
        });
      }

      $(".toggle").unbind('click').click(function () {
    	  event.preventDefault();
          var target = $(this).attr('href');
          $(target).toggleClass('hidden show');
      });
      /**
       * This function is used to show the received/sent data channel messages.
       * @param user
       * @param call
       * @param message
       * @param localmessage
       */
      function updateChatHistory(user, call, message, localmessage) {
        var callIdClass = "." + callController.getCallId(call),
          Digital = new Date(), hours = Digital.getHours(),
          minutes = Digital.getMinutes(), seconds = Digital.getSeconds(), dn = "AM";
        if (hours > 12) {
          dn = "PM";
          hours = hours - 12;
        }
        if (hours == 0) {
          hours = 12;
        }
        if (minutes <= 9) {
          minutes = "0" + minutes;
        }
        if (seconds <= 9) {
          seconds = "0" + seconds;
        }
        var text = "(" + hours + ":" + minutes + ":" + seconds + " " + dn + ") " + user + ":";

        if (localmessage) {
          text += "<span style='font-weight: bold;'>" + message + "</span><br>";
        } else {
          text += "<span>" + message + "</span><br>";
        }
        $(callIdClass + " .display-datachannel").append(text);
        $(callIdClass + " .display-datachannel").animate({
          scrollTop: $(callIdClass + " .display-datachannel")[0].scrollHeight}, 1000);
      }

      /**
       * show the call window
       * @param call
       */
      function showCallWindow(call) {
        if (!call || typeof call == 'undefined') {
          return;
        }

        var callId = callController.getCallId(call),
          callElemSet = $(".call-window" + "." + callId); // the div has two classes: "call-window" and the given call ID.
        var callElem = null, callTitle;
        if (callElemSet.length == 0) {
          callElem = $(".call-window-template").clone();
          callElem.removeClass("call-window-template");
          callElem.addClass(callId);
        } else {
          callElem = callElemSet.eq(0);
        }
        callElem.data("call", call);
        callElem.find(".call-body").show();

        if (callController.isDataChannel(call)) {
          callTitle = "Chat ";
        } else {
          callTitle = "Media Call ";
        }

        if (wscSession.getUserName() == call.caller) {
          callElem.find(".btn-cancel").show();
          callTitle += "To : " + call.callee;
        } else {
          callTitle += "From : " + call.caller;
        }
        callElem.find(".panel-title").text(callTitle);

        callElem.appendTo(".calls").show();
      } // End-of-function showCallWindow(call)

      /**
       * Mute/un-mute the audio tracks according to the mute flag. This method will be called in button click event.
       * @param call
       * @param isMute
       */
      function mute(call, isMute) {
        if (!call){
          console.error("Cannot mute for undefined call!");
          return;
        }
        var peerconnection = call.getPeerConnection();
        if (peerconnection == null) {
          console.error("can not get the audio track. failed to mute audio!");
          return;
        }
        peerconnection.getLocalStreams().map(function(stream) {
          stream.getAudioTracks().map(function(audioTrack) {
            audioTrack.enabled = !isMute;
          });
        });
        muteButton(call, !isMute);
      }

      /**
       * Show/hide mute/un-mute button according to the mute flag.
       * @param call
       * @param showMuteBtn
       */
      function muteButton(call, showMuteBtn) {
        var callIdClass = "." + callController.getCallId(call),
          muteBtn = $(callIdClass + " .btn-mute"),
          unMuteBtn = $(callIdClass + " .btn-unmute");
        if (showMuteBtn) {
          muteBtn.show();
          unMuteBtn.hide();
        } else {
          muteBtn.hide();
          unMuteBtn.show();
        }
      }

      /**
       * according to the current meida muting state, show mute/unmute button
       * @param call
       */
      function showMuteButton(call) {
        var peerconnection = call.getPeerConnection();
        if (peerconnection == null) {
          // For certain rehydration case, peerconnection maybe null, we also need to show buttons.
          muteButton(call, true);
          return;
        }
        peerconnection.getLocalStreams().map(function(stream) {
          stream.getAudioTracks().map(function(audioTrack) {
            muteButton(call, audioTrack.enabled);
          });
        });
      }

      /**
       * according the current status, update the call's UI correspondingly.
       * @param call
       */
      function updateCallUI(call) {
        var callIdClass = "." + callController.getCallId(call);
        $(callIdClass + " .btn-hangup").show();
        $(callIdClass + " .btn-cancel").hide();
        $(callIdClass + " .glyphicon").removeClass("glyphicon-facetime-video").removeClass("glyphicon-remove");
        switchButtons(call);
      } // End-of-function updateCallUI(call)

      /**
       * Update buttons
       * @param call
       */
      function switchButtons(call) {
        if (call.callState.state != wsc.CALLSTATE.ESTABLISHED
          && call.callState.state != wsc.CALLSTATE.UPDATED) {
          return;
        }

        enableUpdateRelatedButtons(call);

        var videoDirection = call.getCallConfig().videoConfig,
          callIdClass = "." + callController.getCallId(call);
        if (videoDirection == wsc.MEDIADIRECTION.SENDRECV ||
             videoDirection == wsc.MEDIADIRECTION.RECVONLY) {
          $(callIdClass + " .mediaCall").show();
          $(callIdClass + " .remoteVideo")[0].play();
          $(callIdClass + " .localVideo")[0].play();
          $(callIdClass + " .remoteVideo").show();
          $(callIdClass + " .localVideo").show();
        } else {
          $(callIdClass + " .mediaCall").hide();
          $(callIdClass + " .remoteVideo").hide();
          $(callIdClass + " .localVideo").hide();
        }
        if (videoDirection == wsc.MEDIADIRECTION.SENDRECV) {
          $(callIdClass + " .btn-removeVideo").show();
          $(callIdClass + " .btn-addVideo").hide();
          
          $(callIdClass + " .glyphicon").addClass("glyphicon-facetime-video");
        } else if (videoDirection == null || videoDirection == wsc.MEDIADIRECTION.NONE) {
          $(callIdClass + " .btn-removeVideo").hide();
          $(callIdClass + " .btn-addVideo").show();
          $(".btn-screenshare").show();
          $("#clientVideo").show();
          $(callIdClass + " .glyphicon").addClass("glyphicon-remove");
        }

        // check if there is audio in this call
        var audioDirection = call.getCallConfig().audioConfig;
        if (audioDirection == null || audioDirection == wsc.MEDIADIRECTION.NONE) {
          $(callIdClass + " .btn-mute").hide();
          $(callIdClass + " .btn-unmute").hide();
          $(callIdClass + " .btn-addAudio").show();
        } else {
          $(callIdClass + " .btn-addAudio").hide();
          showMuteButton(call);
        }

        // check if there is data channel chat in this call
        if (callController.isDataChannel(call)) {
          $(callIdClass + " .datachannelCall").show();
          if (callController.isOnlyDataChannel(call)) {
        	  
            $(callIdClass + " .btn-removeChat").hide();
            $(callIdClass + " .welcomeText").append('<br>You are now connected, please type your question or comment below to get started.');
          } else {
            $(callIdClass + " .btn-removeChat").show();
          }
          $(callIdClass + " .btn-addChat").hide();
        } else {
          $(callIdClass + " .datachannelCall").hide();
          $(callIdClass + " .btn-removeChat").hide();
          $(callIdClass + " .btn-addChat").show();
          $(callIdClass + " .mediaCall").show();
        }
      } // End-of-function switchButtons(callConfig)

      /**
       * Disable buttons related with update function, such as "Add Video", "Add Audio", etc.
       * "Mute" and "Unmute" only change local media stream, so it is not necessary to disable them.
       * This is used when a update related button is clicked so that no more updated actions are
       * triggered before the update finishes.
       */
      function disableUpdateRelatedButtons(call) {
        setUpdateRelatedButtons(call, true);
      }

      /**
       * Enable buttons related with update function, such as "Add Video", "Add Audio", etc.
       */
      function enableUpdateRelatedButtons(call) {
        setUpdateRelatedButtons(call, false);
      }

      /**
       * Set "disable" property for buttons related with update function, such as "Add Video", "Add Audio", etc.
       * @param call the button is of this call
       * @param flag
       */
      function setUpdateRelatedButtons(call, flag) {
        var callIdClass = "." + callController.getCallId(call);
        $(callIdClass + " .btn-removeVideo").prop("disabled", flag);
        $(callIdClass + " .btn-addVideo").prop("disabled", flag);
        $(callIdClass + " .btn-addAudio").prop("disabled", flag);
        $(callIdClass + " .btn-removeChat").prop("disabled", flag);
        $(callIdClass + " .btn-addChat").prop("disabled", flag);
      }
      
      
      $( "#agentCapture-screen" ).click(function() {
    	  $.getScript("https://cdn.webrtc-experiment.com/getScreenId.js", function(){

   		   
              getScreenId(function(error, sourceId, screen_constraints) {
                  // error    == null || 'permission-denied' || 'not-installed' || 'installed-disabled' || 'not-chrome'
                  // sourceId == null || 'string' || 'firefox'
                  // getUserMedia(screen_constraints, onSuccess, onFailure);
              	//alert("--sourceId--" + sourceId);
                  alert("--screen_constraints--" + screen_constraints);     
                  navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                  navigator.getUserMedia(screen_constraints, function(stream) {
                  	
                	  //document.querySelector('video').src = URL.createObjectURL(stream); 
                  	  //$("#video").find("#tv_main_channel").attr("src", URL.createObjectURL(stream))
                  	$("#clientVideo").attr("src", URL.createObjectURL(stream))
                      //document.getElementById("clientVideo").src = URL.createObjectURL(stream);
                      
                      stream.onended = function() {
                          document.getElementById("clientVideo").src = null;
                          //document.getElementById('capture-screen').disabled = false;
                      };
                  }, function(error) {
                      alert(JSON.stringify(error, null, '\t'));
                  });
              });

   		});
      })
      /**
       * Show warning message when call failed.
       * @param call
       * @param callState
       */
      function showWarningMessage(call, callState) {
        $("#makeCallWarningMsg").text("The call failed with code: " + callState.status.code
          + " and reason: " + callState.status.reason);
        $("#makeCallWarningDiv").show();
        $(".btnStartAudio, .btnStartVideo, .btnStartDatachannel").on("click.callFailed", function() {
          $("#makeCallWarningDiv").hide();
          $(".btnStartAudio, .btnStartVideo, .btnStartDatachannel").off("click.callFailed");
        });
        $(".notifications").on("click.callFailed", ".call-accept", function() {
          $("#makeCallWarningDiv").hide();
          $(this).off("click.callFailed");
        });
      }

    } // End-of-function CallUI()

    return new CallUI();
  });
