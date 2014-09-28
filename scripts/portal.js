(function(root) {
    navigator.getUserMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia;

    var Portal = function(peer, video, opts) {
        this._opts = extend({
            recallInterval: 10000,
            callOpts: {
                video: true,
                audio: false
            }
        }, opts);

        this._peer = peer;
        this._video = document.querySelector(video);

        this._localStream = null;
        this._getLocalStream();

        this._setupAutoAnswer();
    };

    Portal.prototype.call = function call(portalId) {
        var self = this;

        console.info('Call to', portalId);
        var call = this._peer.call(portalId, this._localStream);
        call.on('stream', function(stream) {
            self._video.setAttribute('src', URL.createObjectURL(stream));
        });

        this._setupRefresh(call);
    };

    Portal.prototype._setupAutoAnswer = function _setupAutoAnswer() {
        var self = this;

        this._peer.on('call', function(call) {
            console.info('Incoming call');

            call.answer(self._localStream);

            call.on('stream', function(stream) {
                self._video.setAttribute('src', URL.createObjectURL(stream));
            });
        });
    };

    Portal.prototype._setupRefresh = function _setupRefresh(call) {
        var self = this;

        function refreshAfterInterval() {
            setTimeout(function() {
                window.location.reload();
            }, self._opts.recallInterval);
        }

        call.on('close', function() {
            refreshAfterInterval();
        });

        call.on('error', function(err) {
            refreshAfterInterval();
        });
    };

    Portal.prototype._getLocalStream = function _getLocalStream() {
        var self = this;

        navigator.getUserMedia(this._opts.callOpts, function(stream) {
            self._localStream = stream;
            self._opts.ready(stream);
        }, function(err) {
            console.error('Failed to get local video stream', err);
        });
    };

    // Utility functions

    // Copy all attributes from source object to destination object.
    // destination object is mutated.
    function extend(destination, source) {
        destination = destination || {};

        for (var attrName in source) {
            if (source.hasOwnProperty(attrName)) {
                destination[attrName] = source[attrName];
            }
        }

        return destination;
    }

    root.Portal = Portal;
})(window);
