
//mediator acts as interface between web application and background.js
window.postMessage({ type: 'OCWSC_PING', text: 'start' }, '*');
var port = chrome.runtime.connect(chrome.runtime.id);

port.onMessage.addListener(function(msg) {
	window.postMessage(msg, '*');
});

window.addEventListener('message', function(event) {
	if (event.source != window) return;


	if (event.data.type && ((event.data.type === 'OCWSC_REQUEST') ||
							(event.data.type === 'OCWSC_CANCEL'))) {
		port.postMessage(event.data);
	}
}, false);
