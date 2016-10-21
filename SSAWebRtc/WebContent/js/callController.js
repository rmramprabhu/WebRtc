define(['callSettings'], function(callSettings) {
    
  function callController() {
    var wscSession,  // session between client and SE server
      callPackage = null,// instance of wsc.CallPackage
      calls = {},// the object contains all call objects. key: call ID, value: call object
      direction = wsc.MEDIADIRECTION; // variable alias

    /**
     * Create call package, attach event handler to it, etc.
     * @param session
     * @param onIncomingCall
     * @param initCall
     * @param callEstablished
     */
    this.init = function(session, onIncomingCall, initCall, callEstablished) {
      callSettings.init();
      wscSession = session;
      callPackage = new wsc.CallPackage(wscSession);
      callPackage.onIncomingCall = onIncomingCall;
      callPackage.setTrickleIceMode(callSettings.getTrickle());
      callPackage.onResurrect = resurrectHandler.bind(null, initCall, callEstablished);
      callSettings.addListener(function(settings) {
        callPackage.setTrickleIceMode(settings.getTrickle());
      });
    };

    /**
     * Resurrect handler
     * @param initCall
     * @param callEstablished
     * @param resurrectedCall
     */
    function resurrectHandler(initCall, callEstablished, resurrectedCall) {
      var onResumeCallSuccess = function () {
          var callState = resurrectedCall.getCallState().state;
          if (callState == wsc.CALLSTATE.ESTABLISHED || callState == wsc.CALLSTATE.UPDATED) {
            callEstablished(resurrectedCall);
          }
        },
        onResumeCallFailed = function () {
          console.log("Failed to resume call.");
        };

      initCall(resurrectedCall);
      calls[resurrectedCall.subSessionId] = resurrectedCall;
      resurrectedCall.resume(onResumeCallSuccess, onResumeCallFailed);
    } // End-of-function onResurrect(resurrectedCall)

    /**
     * Get user media on client side not in SDK, according to user's
     * configuration.
     * @param onSuccess callback function invoked when get user media done
     */
    function getUserMedia(onSuccess) {
      var constraints = getConstraints(),
        onCaptureError = function (error) {
          console.log("on capture error: " + error.name + " Msg: "
            + error.message + " ConstraintName : " + error.constraintName);
        };
      // getUserMedia is defined in wsc-common.js(adapter.js)
      window.navigator.getUserMedia(constraints, onSuccess, onCaptureError);
    }

    /**
     * Generate the constraints for getUserMedia. Using client configuration :
     * frame rate, video resolution
     */
    function getConstraints() {
      var screen_constraints = {mandatory : {}, optional : []},
        frameRate = callSettings.getFrameRate(),
        videoWidth = callSettings.getVideoWidth(),
        videoHeight = callSettings.getVideoHeight();
      // When transferred to NTSC television, the rate is effectively slowed
      // to 23.976 FPS (24ร—1000รท1001 to be exact)
      mainFrameRate = frameRate * 1000 / 1001;
      if (videoWidth > 0 && videoHeight > 0) {
        screen_constraints.mandatory.maxWidth = videoWidth;
        screen_constraints.mandatory.maxHeight = videoHeight;
        if (frameRate > 0) {
          screen_constraints.mandatory.maxFrameRate = mainFrameRate;
        }
      } else if (frameRate > 0) {
        screen_constraints.mandatory.maxFrameRate = mainFrameRate;
      } else {
        screen_constraints = true;
      }
      return {
        audio : true,
        video : screen_constraints
      };
    }

    /**
     * Make a DataChannel chat.
     * @param callee
     * @param initCall when call object is created, call this function to process the call object
     * @param callErrorHandler the handler when error of the call happens
     */
    this.startDataChannel = function(callee, initCall, callErrorHandler) {
      var callConfig = new wsc.CallConfig(null, null, [{"label":"DataChannelLabel"}]);
      createCall(callee, callConfig, initCall, callErrorHandler);
    };

    /**
     * Make a voice call
     * @param callee
     * @param initCall
     * @param withChat flag: true if start the call with data channel, otherwise, false.
     * @param callErrorHandler the handler when error of the call happens
     */
    this.startVoiceCall = function(callee, initCall, withChat, callErrorHandler) {
      var audioConfig = direction.SENDRECV, videoConfig = direction.NONE;
      var dataChannelConfig = null;
      if (withChat) {
        dataChannelConfig = [{"label":"DataChannelLabel"}];
      }
      var callConfig = new wsc.CallConfig(audioConfig, videoConfig, dataChannelConfig);
      createCall(callee, callConfig, initCall, callErrorHandler);
    };

    /**
     * Create a call and start it
     * @param callee
     * @param callConfig
     * @param initCall
     * @param streamArray
     */
    function createCall(callee, callConfig, initCall, callErrorHandler, streamArray) {
      var call = callPackage.createCall(callee, callConfig, callErrorHandler);
      initCall(call);
      call.start(streamArray);
      calls[call.subSessionId] = call;
    } // End-of-function createCall(callee, callConfig, initCall)

    /**
     * Check if resolution is set by default.
     * @returns {boolean}
     */
    function isDefaultResolution() {
      return callSettings.getFrameRate() == "-1" && callSettings.getVideoWidth() < 0;
    }

    /**
     * Make a video call
     * @param target
     * @param initCall
     * @param withChat
     * @param callErrorHandler the handler when error of the call happens
     */
    this.startVideoCall = function(target, initCall, withChat, callErrorHandler) {
      var audioConfig = direction.SENDRECV, videoConfig = direction.SENDRECV;
      var dataChannelConfig = null;
      if (withChat) {
        dataChannelConfig = [{"label":"DataChannelLabel"}];
      }
      var callConfig = new wsc.CallConfig(audioConfig, videoConfig, dataChannelConfig);
      if (isDefaultResolution()) {
        createCall(target, callConfig, initCall, callErrorHandler);
      } else {
        getUserMedia(onCapture);
        function onCapture(stream) {
          createCall(target, callConfig, initCall, callErrorHandler, [ stream ]);
        }
      }
    };

    /**
     * Accept the incoming call
     * @param call
     * @param callConfig
     */
    this.accept = function(call, callConfig) {
      if (callConfig.videoConfig == direction.SENDRECV) {
        if (isDefaultResolution()) {
          call.accept(callConfig);
        } else {
          getUserMedia(onCapture);
          function onCapture(stream) {
            call.accept(callConfig, [ stream ]);
          }
        }
      } else {
        call.accept(callConfig);
      }
      calls[call.subSessionId] = call;
    };

    /**
     * Reject the incoming call
     * @param call
     */
    this.reject = function(call) {
      call.decline();
    };

    /**
     * Upgrade exist call to add audio
     * @param callId
     */
    this.addAudio = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.audioConfig = direction.SENDRECV;
      call.update(callConfig);
    };

    /**
     * Upgrade exist voice call to add video
     * @param callId
     */
    this.addVideo = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.videoConfig = direction.SENDRECV;
      // for data channel call, when user call "add video", the audio also should be added.
      if (callConfig.audioConfig == null
        || callConfig.audioConfig == direction.NONE) {
        callConfig.audioConfig = direction.SENDRECV;
      }

      if (isDefaultResolution()) {
        call.update(callConfig);
      } else {
        getUserMedia(onCapture);
        function onCapture(stream) {
          call.update(callConfig, [ stream ]);
        }
      }
    };

    /**
     * Upgrade exist video call to remove video
     * @param callId
     */
    this.removeVideo = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.videoConfig = direction.NONE;
      call.update(callConfig);
    };

    /**
     * Mute ongoing call, we use re-invite or client removing audioTrack?
     * @param callId
     */
    this.mute = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.audioConfig = direction.RECVONLY;
      call.update(callConfig);
    };

    /**
     * Add back voice to the ongoing call
     * @param callId
     */
    this.unMute = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.audioConfig = direction.SENDRECV;
      call.update(callConfig);
    };

    /**
     * Add chat over data channel to the ongoing call
     * @param callId
     */
    this.addChat = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.dataChannelConfig = [{"label":"DataChannelLabel"}];
      call.update(callConfig);
    };

    /**
     * Remove the data channel chat from an ongoing call
     * @param callId
     */
    this.removeChat = function(callId) {
      var call = calls[callId];
      var callConfig = call.getCallConfig();
      callConfig.dataChannelConfig = null;
      call.update(callConfig);
    };

    this.screenShare = function(callId) {
        var call = calls[callId];
        var callConfig = call.getCallConfig();
        callConfig.dataChannelConfig = null;
        call.update(callConfig);
      };
      

      
    /**
     * Hang up the ongoing call
     * @param callId
     */
    this.hangUp = function(callId) {
      var call = calls[callId];
      console.log ("Ending call...");
      call.end ();
      var agentid = call.callee;
      var clientid = call.caller;
      $.ajax({
	        url: 'https://13.63.249.131:7002/SSACallCenter/mvc/webRtc/disconnectagent/customerid/' + clientid + '/agentid/' + agentid,
	        type: 'GET',
	        success: function (data) {
	        	alert(data);
	        },
	        async:false,
	        error: function () {
	            //alert("error");
	        }
	        
	    });
      delete calls[callId];
    };

    /**
     * When call end event is triggered, this method will be invoked.
     * @param callId
     */
    this.cleanup = function(callId) {
      delete calls[callId];
    };

    /**
     * check whether the call is data channel call.
     * @param call
     */
    this.isDataChannel = function(call) {
      return call.getCallConfig().dataChannelConfig;
    };

    /**
     * check whether the call is only data channel call.
     * @param call
     */
    this.isOnlyDataChannel = function(call) {
      return call.getCallConfig().dataChannelConfig
        && (call.getCallConfig().audioConfig == null || call.getCallConfig().audioConfig == wsc.MEDIADIRECTION.NONE)
        && (call.getCallConfig().videoConfig == null || call.getCallConfig().videoConfig == wsc.MEDIADIRECTION.NONE);
    };

    /**
     * Get call ID from the call
     * @param call
     * @returns {*}
     */
    this.getCallId = function(call) {
      var callId = call.subSessionId;
      if (callId.indexOf("@") > 0) {
        return callId.substring(0, callId.indexOf("@"));
      } else {
        return callId;
      }
    }; // End-of-function getCallId(call)
  }

  return new callController();
});
