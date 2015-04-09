angular
    .module('IronbaneServer', [
        'ng',
        'game.world-root',
        'systems.autoAnnounceSystem',
        'engine.entity-cache',
        'engine.entity-builder'
    ])
    .run([
        '$log',
        '$rootWorld',
        'AutoAnnounceSystem',
        'EntityBuilder',
        function($log, $rootWorld, AutoAnnounceSystem, EntityBuilder) {
            'use strict';

            $rootWorld.addSystem(new AutoAnnounceSystem());

            // test
            var dbEnt = Entities.findOne({level: 'tower-of-doom', owner: {$exists: true}});
            var ent = EntityBuilder.build(dbEnt.name, dbEnt);
            $rootWorld.addEntity(ent);
        }
    ])
    .run([
        '$log',
        '$window',
        '$rootWorld',
        function($log, $window, $rootWorld) {
            'use strict';

            var startTime = (new Date().getTime()) / 1000.0;
            var lastTimestamp = startTime;
            var _timing = $rootWorld._timing;

            function onRequestedFrame() {
                var timestamp = (new Date().getTime()) / 1000.0;

                Meteor.setTimeout(onRequestedFrame, 200);

                _timing.timestamp = timestamp;
                _timing.elapsed = timestamp - startTime;
                _timing.frameTime = timestamp - lastTimestamp;

                _timing.frameTime = Math.min(_timing.frameTime, 0.3);

                $rootWorld.update(_timing.frameTime, _timing.elapsed, _timing.timestamp);

                lastTimestamp = timestamp;
            }

            $log.log('Ironbane booting up game world...');
            Meteor.setTimeout(onRequestedFrame, 200);
        }
    ]);
