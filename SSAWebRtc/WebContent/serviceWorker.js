'use strict';

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);
 
  var title = 'Notification from WSC server';
  var body = 'Please click to rehydrate the page.';
  var icon = 'images/ic-Innovation-red.png';
  var tag = 'WSC push notification sample';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  console.log('The notification is clicked. The tag is: ', event.notification.tag);
  // Post a message when getting a push notification.
  event.waitUntil(
    clients.matchAll().then(function (clients) {
      clients.forEach(function (client) {
        client.postMessage({
          type: 'PUSH_NOTIFICATION',
          timestamp: Date.now()
        });
      });
      console.log("Post a message to page tabs");
      event.notification.close();
    })
  );
});

self.onmessage = function(event) {
  console.log("Receiving a message from window: ", event.data);
};
