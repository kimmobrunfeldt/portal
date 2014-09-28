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

        this._lastCalled = null;
        this._localStream = null;
        this._getLocalStream();

        this._setupAutoAnswer();
    };

    Portal.prototype.call = function call(portalId) {
        var self = this;

        this._stopRecallLoop();
        var call = self._peer.call(portalId, this._localStream);
        call.on('stream', function(stream) {
            self._video.setAttribute('src', URL.createObjectURL(stream));
        });

        this._lastCalled = portalId;
        this._setupRecall(call);
    };

    Portal.prototype._setupAutoAnswer = function _setupAutoAnswer() {
        var self = this;

        this._peer.on('call', function(call) {
            call.answer(self._localStream);

            call.on('stream', function(stream) {
                console.log('stream')
                self._video.setAttribute('src', URL.createObjectURL(stream));
            });
        });
    };

    Portal.prototype._setupRecall = function _setupRecall(call) {
        var self = this;

        call.on('close', function() {
            console.log('Call closed');

            if (!self._recallTimer) {
                self._startRecallLoop();
            }
        });
    };

    Portal.prototype._startRecallLoop = function _startRecallLoop(portalId) {
        console.log('Trying to recall..');

        this.call(portalId);
        this._recallTimer = setTimeout(this._startRecallLoop.bind(this), this._opts.recallInterval);
    };

    Portal.prototype._stopRecallLoop = function _stopRecallLoop() {
        if (this._recallTimer) {
            clearTimeout(this._recallTimer);
        }
    };

    Portal.prototype._getLocalStream = function _getLocalStream() {
        var self = this;

        navigator.getUserMedia(this._opts.callOpts, function(stream) {
            self._localStream = stream;
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
