angular
    .module('server.systems', [
        'server.systems.autoAnnounceSystem',
        'server.systems.movers',
        'server.systems.network',
        'server.systems.persistence',
        'server.systems.trigger',

        'systems.actor',
        'systems.inventory',
        'systems.damage'
    ]);
