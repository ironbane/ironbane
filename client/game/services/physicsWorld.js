angular
    .module('ammo.physics-world', ['ammo'])
    .factory('PhysicsWorld', [
        'Ammo',
        function(Ammo) {
            'use strict';

            var broadphase = new Ammo.btDbvtBroadphase();
            var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            var dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            var solver = new Ammo.btSequentialImpulseConstraintSolver();

            var physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
            physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

            return physicsWorld;
        }
    ]);
