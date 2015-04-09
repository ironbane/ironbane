'use strict';

Meteor.startup(function() {
    // this will boot up the whole server Game Engine
    angular.injector(['IronbaneServer']);
});
