angular
    .module('game.services.analytics', [
        'global.constants'
    ])
    .service('GoogleAnalytics', ["IB_CONSTANTS", function (IB_CONSTANTS) {

        this.setup = function () {
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

          ga('create', IB_CONSTANTS.isDev ? 'UA-55502635-2' : 'UA-55502635-3', 'auto');
        };

        this.track = function () {
          ga('send', 'pageview');
        };

    }]);