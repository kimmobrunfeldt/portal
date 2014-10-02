(function(root) {
    navigator.getUserMedia = navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia;

    var Portal = function(peer, video, opts) {
        this._opts = extend({
            recallInterval: 10000,
            callOpts: {
                video: {
                    mandatory: {
                        minWidth: 1900,
                        minHeight: 1000
                    }
                },
                audio: false
            }
        }, opts);

        this._peer = peer;
        this._video = document.querySelector(video);

        this._localStream = null;
        this._getLocalStream();

        this._setupAutoAnswer();
        this._setupDataListen();
    };

    Portal.prototype.call = function call(portalId) {
        var self = this;

        console.info('Call to', portalId);
        var call = this._peer.call(portalId, this._localStream);
        call.on('stream', function(stream) {
            self._video.setAttribute('src', URL.createObjectURL(stream));
        });

        this._connection = peer.connect(portalId);
        this._setupRefresh(call, this._connection);
    };


    Portal.prototype.send = function send(data) {
        this._connection.send(JSON.stringify(data));
    };

    Portal.prototype.open = function open(percent, opts) {
        this.setToPosition(100, opts);
    };

    Portal.prototype.close = function close(percent, opts) {
        this.setToPosition(0, opts);
    };

    Portal.prototype.setToPosition = function setToPosition(percent, opts) {
        move(this._opts.selector)
          .duration(70)
          .scale(percent / 100)
          .end();
    };

    Portal.prototype.onData = function onData(data) {
        if (data.command === 'open') {
            this.setToPosition(data.value);
        }
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

    Portal.prototype._setupDataListen = function _setupDataListen() {
        var self = this;

        this._peer.on('connection', function(conn) {
            conn.on('data', function(data) {
                self.onData(JSON.parse(data));
            });
        });
    };

    Portal.prototype._setupRefresh = function _setupRefresh(call, connection) {
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

        connection.on('close', function() {
            refreshAfterInterval();
        });

        connection.on('error', function(err) {
            refreshAfterInterval();
        });
    };

    Portal.prototype._getLocalStream = function _getLocalStream() {
        var self = this;

        navigator.getUserMedia(this._opts.callOpts, function(stream) {
            self._localStream = stream;
            self._opts.ready(stream);
            //self._video.setAttribute('src', URL.createObjectURL(stream));

        }, function(err) {
            console.error('Failed to get local video stream', err);
            self._opts.error(err);
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
