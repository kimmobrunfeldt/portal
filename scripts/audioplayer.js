(function(root) {

    var AudioPlayer = function(sounds) {
        this._sounds = {};

        for (var sound in sounds) {
            if (sounds.hasOwnProperty(sound)) {
                this[sound] = new Howl({
                    urls: [sounds[sound]]
                });
            }
        }
    };

    root.AudioPlayer = AudioPlayer;
})(window);
