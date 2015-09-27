angular
    .module('server.boot', [
        'server.boot.checkUserProfile',
        'server.boot.createAdmins',
        'server.boot.removeOldGuests',
        'server.boot.onCreateUser',
        'server.boot.periodicStats'
    ]);
