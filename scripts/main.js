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

function initShortcuts(portal) {
    Mousetrap.bind('c', function() {
        var portalId = window.prompt("Input portal id to connect");

        if (portalId) {
            portal.call(portalId);
        }
    });
}

$(function() {
    var hash = getUrlHash();

    if (!hash) {
        hash = randomId(3);
        window.location.hash = '#' + hash;
    }

    var peer = new Peer(hash, {key: PEERJS_API_KEY, debug: 3});
    var portal = new Portal(peer, '#video', {

    });

    initShortcuts(portal);
});
