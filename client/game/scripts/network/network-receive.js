angular
    .module('game.scripts.network-receive', [
        'three',
        'ammo',
        'engine.scriptBank'
    ])
    .run([
        '$log',
        'ScriptBank',
        'THREE',
        'Ammo',
        function($log, ScriptBank, THREE, Ammo) {
        'use strict';

        var btVec3 = new Ammo.btVector3();
        var btQuat = new Ammo.btQuaternion(0, 0, 0, 1);

        var NetworkReceiveScript = function(entity, world) {
            this.entity = entity;
            this.world = world;

            this.networkReceiveTimer = 0.0;

            this.desiredPosition = new THREE.Vector3();
            this.desiredRotation = new THREE.Euler();
        };

        var toSimpleRotationY = function(rotation) {
            var rotVec = new THREE.Vector3(0, 0, 1);
            rotVec.applyEuler(rotation);

            var simpleRotationY = (Math.atan2(rotVec.z, rotVec.x));
            if (simpleRotationY < 0) {
                simpleRotationY += (Math.PI * 2);
            }
            simpleRotationY = (Math.PI * 2) - simpleRotationY;

            return simpleRotationY;
        };

        NetworkReceiveScript.prototype.update = function(dTime) {

            this.networkReceiveTimer += dTime;

            if (this.networkReceiveTimer > 1.0) {
                this.networkReceiveTimer = 0.0;

                var meteorEntity = Entities.findOne({
                    _id: this.entity.doc._id
                });

                if (meteorEntity) {
                    this.desiredPosition.deserialize(meteorEntity.position);
                    this.desiredRotation.deserialize(meteorEntity.rotation);
                }
            }

            // var oldy = this.entity.position.y;
            // this.entity.position.lerp(this.desiredPosition, dTime*2);
            // this.entity.position.y = oldy;
            // this.entity.position.lerp(this.desiredPosition, dTime);

            var rigidBodyComponent = this.entity.getComponent('rigidBody');

            if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                var toVec = this.desiredPosition.clone().sub(this.entity.position);
                var currentVel = rigidBodyComponent.rigidBody.getLinearVelocity();
                currentVel = currentVel.toTHREEVector3();
                btVec3.setValue(toVec.x, currentVel.y, toVec.z);
                rigidBodyComponent.rigidBody.setLinearVelocity(btVec3);
                // rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3);

                if (toVec.lengthSq() > 16) {
                    btVec3.setValue(this.desiredPosition.x, this.desiredPosition.y, this.desiredPosition.z);
                    var btTransform = new Ammo.btTransform(btQuat, btVec3);
                    rigidBodyComponent.rigidBody.setWorldTransform(btTransform);
                }
            }


            var entityRotationY = toSimpleRotationY(this.entity.rotation);
            var desiredRotationY = toSimpleRotationY(this.desiredRotation);

            var side = true;
            if (desiredRotationY < entityRotationY) {
                side = Math.abs(desiredRotationY - entityRotationY) < (Math.PI);
            } else {
                side = ((desiredRotationY - entityRotationY) > (Math.PI));
            }

            var distance = Math.abs(desiredRotationY - entityRotationY);

            var speed = 2.0;

            if (distance > 0.03) {
                if (side) {
                    this.entity.rotateY(-speed * dTime);
                } else if (!side) {
                    this.entity.rotateY(speed * dTime);
                }
            }

        };

        ScriptBank.add('/scripts/built-in/network-receive.js', NetworkReceiveScript);
    }]);
