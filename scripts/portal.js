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

        this._connection = null;
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
            self._video.srcObject = stream;
        });

        this._connection = this._peer.connect(portalId);
        this._connection.on('data', function(data) {
            self.onData(data);
        });

        this._setupRefresh(call, this._connection);
    };

    Portal.prototype.send = function send(data) {
        this._connection.send(JSON.stringify(data));
    };

    Portal.prototype.setToPosition = function setToPosition(position, opts) {
        var newPosition = _.max([settings.minPortalPosition, position]) * 100;
        var video = document.getElementById('video');
        var circleHeight = document.getElementById('effect-container').clientHeight;
        var newHeight = position * circleHeight - 100 * position;

        video.style.webkitMaskSize = newHeight + 'px';

        move(this._opts.selector)
          .duration(70)
          .scale(position)
          .end();
    };

    Portal.prototype.onData = function onData(data) {
        data = JSON.parse(data);
        console.log(data)
        if (data.command === 'open') {
            this.setToPosition(data.value);
        }
    };

    Portal.prototype.isConnected = function isConnected() {
        return this._connection !== null;
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
            console.log('Received connection')
            self._connection = conn;
            self._connection.on('data', self.onData);
        });
    };

    Portal.prototype._setupRefresh = function _setupRefresh(call, connection) {
        var self = this;

        function refreshAfterInterval() {
            self.setToPosition(0);
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

        navigator.mediaDevices.getUserMedia(this._opts.callOpts)
            .then(function(stream) {
                self._localStream = stream;
                self._opts.ready(stream);
                //self._video.setAttribute('src', URL.createObjectURL(stream));
            })
            .catch(function(err) {
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
