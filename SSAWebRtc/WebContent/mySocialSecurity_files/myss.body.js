// global mySS scripts
(function(window, document) {

    // execute the following JavaScript in strict mode
    'use strict';

    // check for modern browser support
    if ('visibilityState' in document) {

        // grab quote container
        var mySSQuoteText = document.querySelectorAll('.myss-quote-text');

        // select a random number
        var randomquote = Math.floor(Math.random() * (mySSQuoteText.length));

        // show quote
        if (mySSQuoteText.length > 0) {
            mySSQuoteText[randomquote].classList.remove('hide');
        }

        // check for video links
        var videoLinks = document.querySelectorAll('.c-video-link');

        if (videoLinks.length > 0) {

            // set base URLs for youtube
            var baseThumbURL = "https://i.ytimg.com/vi/";
            var baseVideoURL = "https://www.youtube-nocookie.com/embed/";

            // loop through links
            for (var i = -1, l = videoLinks.length; ++i < l;) {

                // grab video id
                var videoID = videoLinks[i].getAttribute('data-video-id');

                // add thumbnail image
                videoLinks[i].style.backgroundImage = 'url(' + baseThumbURL + videoID + '/sddefault.jpg)';

                // set id based on which link was clicked
                (function(index) {

                    // add event handler
                    videoLinks[i].addEventListener('click', function(event) {

                        // prevent href
                        event.preventDefault();

                        // grab data attributes
                        var videoID = this.getAttribute('data-video-id');
                        var videoTitle = this.getAttribute('data-video-title');
                        var videoHeight = this.getAttribute('data-video-height') || 220;
                        var videoWidth = this.getAttribute('data-video-width') || 380;

                        // create iframe
                        var iFrame = document.createElement('iframe');
                        var iFrameURL = baseVideoURL + videoID + '?rel=0&autoplay=1&autohide=1&modestbranding=1';

                        // set iframe attributes
                        iFrame.setAttribute('id', 'c-video-iframe-' + index);
                        iFrame.setAttribute('src', iFrameURL);
                        iFrame.setAttribute('frameborder', '0');
                        iFrame.setAttribute('title', videoTitle + ' Video');
                        iFrame.setAttribute('height', videoHeight);
                        iFrame.setAttribute('width', videoWidth);
                        iFrame.setAttribute('allowfullscreen', true);

                        // replace video link with iframe
                        this.parentNode.replaceChild(iFrame, this);

                        // move focus to iframe
                        document.getElementById('c-video-iframe-' + index).focus();

                    });

                })(i);
            }

        }

    }

}(window, document));
