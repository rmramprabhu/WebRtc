define(['jquery'], function ($) {

  var listeners = {};

  var getTrickle = function() {
    return $("input:radio[name=trickleMode]:checked").val();
  };

  var getIceServer = function() {
    return $("#iceServers").val();
  };

  var getFrameRate = function() {
    return parseInt($("#frameRate").val());
  };

  var getVideoResolution = function() {
    return JSON.parse($("#videoResolution").val());
  };

  var getVideoWidth = function() {
    return getVideoResolution().width;
  };

  var getVideoHeight = function() {
    return getVideoResolution().height;
  };

  var updateCallSettings = function() {
    var settings = {
      trickle: getTrickle(), 
      iceServer: getIceServer(), 
      frameRate: getFrameRate(),
      videoResolution: getVideoResolution()
    };
    // update settings to sessionStorage.
    sessionStorage.setItem("callSettings", JSON.stringify(settings));
    // notify all listeners.
    $.each( listeners, function( id, listener ) {
      listener(getThis());
    });
  };

  var init = function() {
    var settings = sessionStorage.getItem("callSettings");
    if (settings) {
      settings = JSON.parse(settings); // convert to JSON object
      // Initialize the configuration with data stored in sessionStorage.
      $('input:radio[name=trickleMode]').filter('[value="' + settings.trickle + '"]').attr('checked', true);
      $('#iceServers').val(settings.iceServer);
      $("#frameRate").val(settings.frameRate);
      $("#videoResolution").val(JSON.stringify(settings.videoResolution));
    }
    // Add update event handler to all settings component.
    $("input:radio[name=trickleMode]").click(function() {
      updateCallSettings();
    });

    // "change" event for these four components has same handler
    $("#videoResolution, #iceServers, #frameRate").on('change', function() {
      updateCallSettings();
    });
  };

  var destroy = function() {
    sessionStorage.removeItem("callSettings");
  };

  /**
   * Add listener to call settings.
   * @param listener function which is invoked when call settings updating
   * @returns {string} the id of the listener.
   */
  var addListener = function(listener) {
    var id = 'L' + new Date().getTime();
    listeners[id] = listener;
    return id;
  };

  /**
   * Remove the listener from call settings.
   * @param id the id of the listener
   * @returns {string} the id of the listener.
   */
  var removeListener = function(id) {
    delete listeners[id];
  };

  var getThis = function() {
    return {
      getTrickle: getTrickle,
      getIceServer: getIceServer,
      getFrameRate: getFrameRate,
      getVideoWidth: getVideoWidth,
      getVideoHeight: getVideoHeight,
      addListener: addListener,
      removeListener: removeListener,
      init: init,
      destroy: destroy
    };
  };

  return getThis();
});