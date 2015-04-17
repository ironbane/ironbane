'use strict';

Meteor.startup(function() {
    // this will boot up the whole server Game Engine
    global.engine = angular.injector(['IronbaneServer']);
});
