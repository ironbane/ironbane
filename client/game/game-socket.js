angular
    .module('game.game-socket', ['engine.socket'])
    .provider('$gameSocket', function () {
        var _url = 'http://localhost:3000';

        this.setUrl = function (url) {
            _url = url;
        };

        this.$get = function (Socket) {
            var socket = new Socket(_url);

            return socket;
        };
    });
