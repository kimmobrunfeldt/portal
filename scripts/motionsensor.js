(function(root) {
    var MotionSensor = function(opts) {
        var self = this;

        this._opts = opts;

        // Setup Leap loop with frame callback function
        var controllerOptions = {};

        // Throttle leap loop to prevent high CPU usage
        var onHand = _.throttle(function(frame) {
            var hand = self._getLowestHand(frame.hands);

            var interactionBox = frame.interactionBox;
            var position = hand.stabilizedPalmPosition;
            var normalizedPosition = interactionBox.normalizePoint(position, true);

            // Hand's height will be value from 0 to 1
            self._opts.onHand(normalizedPosition[1]);
        }, 150);

        Leap.loop(controllerOptions, function onFrame(frame) {
            if (frame.hands.length > 0) {
                onHand(frame);
            }
        });
    };

    MotionSensor.prototype._getLowestHand = function _getLowestHand(hands) {
        return _.min(hands, this._getHandHeight);
    };

    MotionSensor.prototype._getHandHeight = function _getHandHeight(hand) {
        return hand.stabilizedPalmPosition[1];
    };

    root.MotionSensor = MotionSensor;
})(window);
