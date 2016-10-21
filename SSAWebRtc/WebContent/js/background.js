var data_sources = ['screen', 'window'],
    desktopMediaRequestId = '';

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function (msg) {
    if(msg.type === 'OCWSC_REQUEST') {
      requestScreenSharing(port, msg);
    }

    if(msg.type === 'OCWSC_CANCEL') {
      cancelScreenSharing(msg);
    }
  });
});

function requestScreenSharing(port, msg) {
  // https://developer.chrome.com/extensions/desktopCapture
  // params:
  //  - 'data_sources' Set of sources that should be shown to the user.
  //  - 'targetTab' Tab for which the stream is created.
  //  - 'streamId' String that can be passed to getUserMedia() API
  desktopMediaRequestId = chrome.desktopCapture.chooseDesktopMedia(data_sources, port.sender.tab, function(streamId) {
    if (streamId) {
      msg.type = 'OCWSC_DIALOG_SUCCESS';
      msg.streamId = streamId;
    } else {
      msg.type = 'OCWSC_DIALOG_CANCEL';
    }
    port.postMessage(msg);
  });
}

function cancelScreenSharing(msg) {
  if (desktopMediaRequestId) {
     chrome.desktopCapture.cancelChooseDesktopMedia(desktopMediaRequestId);
  }
}
