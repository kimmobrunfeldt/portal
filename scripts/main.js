function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getUrlHash() {
    return window.location.hash.substr(1);
}

function randomId(length) {
    var text = "";
    var charSet = "abcdefghjkmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; ++i) {
        text += charSet.charAt(randomInt(0, charSet.length - 1));
    }

    return text;
}

window.onload = function() {
    var isSlave = window.location.search === '?slave=true';
    var hash = getUrlHash();

    if (!isSlave && !hash) {
        hash = randomId(3);
        window.location.hash = '#' + hash;
    }

    // Master uses the id given in url
    var peerId = isSlave ? randomId(10) : hash;
    console.log('Use id', peerId);
    var peer = new Peer(peerId, {key: PEERJS_API_KEY, debug: 3});

    peer.on('error', function(err) {
        console.log(err)
        if (err.type === 'unavailable-id') {
            window.location.search = '?slave=true';
        } else {
            setTimeout(function() {
                window.location.reload();
            }, 10000);
        }
    });

    var audioPlayer = new AudioPlayer({
        'open': 'audio/open.mp3'
    });

    audioPlayer['open'].loop(true);
    audioPlayer['open'].play();

    // Workaround to prevent invalid state error in getUserMedia
    setTimeout(function() {
        var portal = new Portal(peer, '#video', {
            ready: function() {
                if (isSlave) {
                    portal.call(hash);
                }
            },
            error: function(err) {
                window.alert('Failed to open web camera: ' + err.name);
            }
        });

        var sensor = new MotionSensor({
            onHand: function(height) {
                console.log('onHand', height)

                var newVolume = _.min([1.1 - height, 1]);
                audioPlayer['open'].volume(newVolume);

            }
        });

    }, 500);
};
