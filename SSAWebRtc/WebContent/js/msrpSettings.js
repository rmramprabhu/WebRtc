define(['jquery'], function ($) {

  var getMsrpSecure = function() {
    return $("input:radio[name=msrpSecure]:checked").val();
  };
  var isSecure = function() {
    return getMsrpSecure() === 'secure';
  };

  var getAcceptType = function() {
    if ($('#textPlain').is(':checked')) {
      return 'text/plain';
    } else {
      return 'message/cpim';
    }
  };

  var getChunkSize = function() {
    return $("#chunkSize").val();
  };

  var updateMsrpSettings = function() {
    var settings = {
      secure: getMsrpSecure(),
      chunkSize: getChunkSize(),
      acceptType: getAcceptType()
    };
    // update settings to sessionStorage.
    sessionStorage.setItem("msrpSettingsuration", JSON.stringify(settings));
  };

  var init = function() {
    // Initialize the configuration with settings stored in sessionStorage.
    var settings = sessionStorage.getItem("msrpSettingsuration");
    if (settings) {
      settings = JSON.parse(settings); // convert to JSON object
      $('input:radio[name=msrpSecure]').filter('[value="' + settings.secure + '"]').attr('checked', true);
      $('#chunkSize').val(settings.chunkSize);
      $('input:radio[name=acceptType]').filter('[value="' + settings.acceptType + '"]').attr('checked', true);
    }

    // Add update event handler to all settings component.
    $("input:radio[name=msrpSecure], input:radio[name=acceptType]").click(function() {
      updateMsrpSettings();
    });

    $("#chunkSize").on('change', function() {
      updateMsrpSettings();
    });
  };

  var destroy = function() {
    sessionStorage.removeItem("msrpSettingsuration");
  };

  return {
    isSecure: isSecure,
    getAcceptType: getAcceptType,
    getChunkSize: getChunkSize,
    init: init,
    destroy: destroy
  };
});