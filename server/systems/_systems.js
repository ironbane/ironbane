angular
    .module('server.systems', [
        'server.systems.autoAnnounceSystem',
        'server.systems.movers',
        'server.systems.network',
        'server.systems.persistence',
        'server.systems.spawn',
        'server.systems.trigger',

        'systems.actor',
        'systems.armor',
        'systems.health',
        'systems.buff',
        'systems.inventory',
        'systems.damage',
        'systems.teleporter',
        'systems.mesh'
    ]);
