/* jshint bitwise: false */

angular
    .module('game.systems.collisionReporter', [
        'ces',
        'three',
        'ammo',
        'ammo.physics-world',
        'ces.signal'
    ])
    .factory('CollisionReporterSystem', [
        'System',
        'Ammo',
        '$q',
        'PhysicsWorld',
        'THREE',
        'Signal',
        function(System, Ammo, $q, PhysicsWorld, THREE, Signal) {
            'use strict';

            // A lot of code here is based on Chandler Prall's Physijs
            // https://github.com/chandlerprall/Physijs/

            // Some is also from PlayCanvas
            // https://github.com/playcanvas/engine

            // Collision reporting
            var collisions = {};
            var frameCollisions = {};
            var contacts0 = [];
            var contacts1 = [];

            // var EVENT_CONTACT = 'contact';
            // var EVENT_COLLISION_START = 'collisionstart';
            // var EVENT_COLLISION_END = 'collisionend';
            // var EVENT_TRIGGER_ENTER = 'triggerenter';
            // var EVENT_TRIGGER_LEAVE = 'triggerleave';

            var FLAG_CONTACT = 1;
            var FLAG_COLLISION_START = 2;
            var FLAG_COLLISION_END = 4;
            var FLAG_TRIGGER_ENTER = 8;
            var FLAG_TRIGGER_LEAVE = 16;
            var FLAG_GLOBAL_CONTACT = 32;

            // holds all possible collision events in a table that has this form:
            //                         STATIC_RIGID_BODY | NON_STATIC_RIGID_BODY | TRIGGER
            // ------------------------------------------------------------------------------
            // STATIC_RIGID_BODY     |     flags         |        flags          |   flags
            // NON_STATIC_RIGID_BODY |     flags         |        flags          |   flags
            // TRIGGER               |     flags         |        flags          |   flags
            // ------------------------------------------------------------------------------

            var collisionTable = [
                [0, FLAG_GLOBAL_CONTACT | FLAG_CONTACT | FLAG_COLLISION_START | FLAG_COLLISION_END, 0],
                [FLAG_GLOBAL_CONTACT | FLAG_CONTACT | FLAG_COLLISION_START | FLAG_COLLISION_END, FLAG_GLOBAL_CONTACT | FLAG_CONTACT | FLAG_COLLISION_START | FLAG_COLLISION_END, FLAG_TRIGGER_ENTER | FLAG_TRIGGER_LEAVE],
                [0, FLAG_TRIGGER_ENTER | FLAG_TRIGGER_LEAVE, 0]
            ];

            var getCollisionFlags = function(entity, other) {
                var entityRb = entity.getComponent('rigidBody');
                var otherRb = other.getComponent('rigidBody');

                var entityIsTrigger = !entityRb;
                var otherIsTrigger = !otherRb;

                // early exit check
                if (entityIsTrigger && otherIsTrigger) {
                    return 0;
                }

                // early exit check
                if (!entityRb || !otherRb) {
                    return 0;
                }

                var entityRigidBodyComponent = entityRb.rigidBody;
                var otherRigidBodyComponent = otherRb.rigidBody;

                var entityIsNonStaticRb = entityRb && entityRigidBodyComponent.mass !== 0;
                var otherIsNonStaticRb = otherRb && otherRigidBodyComponent.mass !== 0;

                // find flags cell in collision table
                var row = 0;
                var col = 0;

                if (entityIsNonStaticRb) {
                    row = 1;
                } else if (entityIsTrigger) {
                    row = 2;
                }

                if (otherIsNonStaticRb) {
                    col = 1;
                } else if (otherIsTrigger) {
                    col = 2;
                }

                var flags = collisionTable[row][col];

                // TODO optimize flags
                // if (flags) {
                //     var collision = entity.collision;

                //     // turn off flags that do not correspond to event listeners
                //     if (!this.hasEvent(EVENT_CONTACT)) {
                //         flags = flags & (~FLAG_GLOBAL_CONTACT);
                //     }

                //     if (!collision.hasEvent(EVENT_CONTACT)) {
                //         flags = flags & (~FLAG_CONTACT);
                //     }

                //     if (!collision.hasEvent(EVENT_COLLISION_START)) {
                //         flags = flags & (~FLAG_COLLISION_START);
                //     }

                //     if (!collision.hasEvent(EVENT_COLLISION_END)) {
                //         flags = flags & (~FLAG_COLLISION_END);
                //     }

                //     if (!collision.hasEvent(EVENT_TRIGGER_ENTER)) {
                //         flags = flags & (~FLAG_TRIGGER_ENTER);
                //     }

                //     if (!collision.hasEvent(EVENT_TRIGGER_LEAVE)) {
                //         flags = flags & (~FLAG_TRIGGER_LEAVE);
                //     }
                // }

                return flags;
            };

            var ContactPoint = function(localPoint, localPointOther, point, pointOther, normal) {
                this.localPoint = localPoint;
                this.localPointOther = localPointOther;
                this.point = point;
                this.pointOther = pointOther;
                this.normal = normal;
            };

            var ContactResult = function(other, contacts) {
                this.other = other;
                this.contacts = contacts;
            };

            var SingleContactResult = function(a, b, contactPoint) {
                this.a = a;
                this.b = b;
                this.localPointA = contactPoint.localPoint;
                this.localPointB = contactPoint.localPointOther;
                this.pointA = contactPoint.point;
                this.pointB = contactPoint.pointOther;
                this.normal = contactPoint.normal;
            };

            var createContactPointFromAmmo = function(contactPoint) {
                var localPointA = new THREE.Vector3(contactPoint.get_m_localPointA().x(), contactPoint.get_m_localPointA().y(), contactPoint.get_m_localPointA().z());
                var localPointB = new THREE.Vector3(contactPoint.get_m_localPointB().x(), contactPoint.get_m_localPointB().y(), contactPoint.get_m_localPointB().z());
                var pointA = new THREE.Vector3(contactPoint.getPositionWorldOnA().x(), contactPoint.getPositionWorldOnA().y(), contactPoint.getPositionWorldOnA().z());
                var pointB = new THREE.Vector3(contactPoint.getPositionWorldOnB().x(), contactPoint.getPositionWorldOnB().y(), contactPoint.getPositionWorldOnB().z());
                var normal = new THREE.Vector3(contactPoint.get_m_normalWorldOnB().x(), contactPoint.get_m_normalWorldOnB().y(), contactPoint.get_m_normalWorldOnB().z());
                return new ContactPoint(localPointA, localPointB, pointA, pointB, normal);
            };

            var createReverseContactPointFromAmmo = function(contactPoint) {
                var localPointA = new THREE.Vector3(contactPoint.get_m_localPointA().x(), contactPoint.get_m_localPointA().y(), contactPoint.get_m_localPointA().z());
                var localPointB = new THREE.Vector3(contactPoint.get_m_localPointB().x(), contactPoint.get_m_localPointB().y(), contactPoint.get_m_localPointB().z());
                var pointA = new THREE.Vector3(contactPoint.getPositionWorldOnA().x(), contactPoint.getPositionWorldOnA().y(), contactPoint.getPositionWorldOnA().z());
                var pointB = new THREE.Vector3(contactPoint.getPositionWorldOnB().x(), contactPoint.getPositionWorldOnB().y(), contactPoint.getPositionWorldOnB().z());
                var normal = new THREE.Vector3(-contactPoint.get_m_normalWorldOnB().x(), -contactPoint.get_m_normalWorldOnB().y(), -contactPoint.get_m_normalWorldOnB().z());
                return new ContactPoint(localPointB, localPointA, pointB, pointA, normal);
            };

            var storeCollision = function(entity, other) {
                var isNewCollision = false;
                var guid = entity.uuid;

                collisions[guid] = collisions[guid] || {
                    others: [],
                    entity: entity
                };

                if (collisions[guid].others.indexOf(other) < 0) {
                    collisions[guid].others.push(other);
                    isNewCollision = true;
                }

                frameCollisions[guid] = frameCollisions[guid] || {
                    others: [],
                    entity: entity
                };
                frameCollisions[guid].others.push(other);

                return isNewCollision;
            };

            var handleEntityCollision = function(entity, other, contactPoints, collisionFlags) {
                var result;

                var collisionReporterComponent = entity.getComponent('collisionReporter');

                if (collisionReporterComponent) {
                    if (collisionFlags & FLAG_CONTACT) {
                        result = new ContactResult(other, contactPoints);
                        collisionReporterComponent.contact.emit(result);
                    }

                    if (collisionFlags & (FLAG_COLLISION_START | FLAG_TRIGGER_ENTER | FLAG_COLLISION_END | FLAG_TRIGGER_LEAVE)) {
                        if (storeCollision(entity, other)) {
                            if (collisionFlags & FLAG_COLLISION_START) {
                                result = result || new ContactResult(other, contactPoints);
                                collisionReporterComponent.collisionStart.emit(result);
                            }

                            if (collisionFlags & FLAG_TRIGGER_ENTER) {
                                collisionReporterComponent.triggerEnter.emit(other);
                            }
                        }
                    }
                }
            };

            var CollisionReporterSystem = System.extend({
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('collisionReporter').add(function(entity) {
                        var collisionReporterComponent = entity.getComponent('collisionReporter');

                        collisionReporterComponent.contact = new Signal();
                        collisionReporterComponent.collisionStart = new Signal();
                        collisionReporterComponent.collisionEnd = new Signal();
                        collisionReporterComponent.triggerEnter = new Signal();
                        collisionReporterComponent.triggerLeave = new Signal();
                    });

                    world.entityRemoved('collisionReporter').add(function(entity) {
                        // clean up any left over events
                        var component = entity.getComponent('collisionReporter');
                        delete component.contact;
                        delete component.collisionStart;
                        delete component.collisionEnd;
                        delete component.triggerEnter;
                        delete component.triggerLeave;
                    });

                },
                checkCollisions: function() {

                    // Check for collisions and fire callbacks
                    var dispatcher = PhysicsWorld.getDispatcher();
                    var numManifolds = dispatcher.getNumManifolds();
                    var i, j;

                    frameCollisions = {};

                    // loop through the all contacts and fire events
                    for (i = 0; i < numManifolds; i++) {
                        var manifold = dispatcher.getManifoldByIndexInternal(i);
                        var body0 = manifold.getBody0();
                        var body1 = manifold.getBody1();
                        var wb0 = Ammo.castObject(body0, Ammo.btRigidBody);
                        var wb1 = Ammo.castObject(body1, Ammo.btRigidBody);
                        var e0 = wb0.entity;
                        var e1 = wb1.entity;

                        // check if entity is null - TODO: investigate when this happens
                        if (!e0 || !e1) {
                            continue;
                        }

                        var collisionFlags0 = getCollisionFlags(e0, e1);
                        var collisionFlags1 = getCollisionFlags(e1, e0);

                        // do some early checks for optimization
                        if (collisionFlags0 || collisionFlags1) {
                            var numContacts = manifold.getNumContacts();

                            if (numContacts > 0) {
                                var cachedContactPoint, cachedContactResult;
                                var useContacts0 = collisionFlags0 & FLAG_COLLISION_START || collisionFlags0 & FLAG_CONTACT;
                                var useContacts1 = collisionFlags1 & FLAG_COLLISION_START || collisionFlags1 & FLAG_CONTACT;
                                contacts0.length = 0;
                                contacts1.length = 0;

                                for (j = 0; j < numContacts; j++) {
                                    var contactPoint = manifold.getContactPoint(j);

                                    // ??? Don't understand global contact
                                    // if (collisionFlags0 & FLAG_GLOBAL_CONTACT) {
                                    //     cachedContactPoint = createContactPointFromAmmo(contactPoint);
                                    //     this.fire(EVENT_CONTACT, new SingleContactResult(e0, e1, cachedContactPoint));
                                    // }

                                    if (useContacts0) {
                                        cachedContactPoint = cachedContactPoint || createContactPointFromAmmo(contactPoint);
                                        contacts0.push(cachedContactPoint);
                                    }

                                    if (useContacts1) {
                                        contacts1.push(createReverseContactPointFromAmmo(contactPoint));
                                    }
                                }

                                handleEntityCollision(e0, e1, contacts0, collisionFlags0);
                                handleEntityCollision(e1, e0, contacts1, collisionFlags1);
                            }
                        }
                    }

                    // check for collisions that no longer exist and fire events
                    this.cleanOldCollisions();

                },
                cleanOldCollisions: function() {
                    for (var guid in collisions) {
                        if (collisions.hasOwnProperty(guid)) {
                            var entity = collisions[guid].entity;
                            var collisionReporterComponent = entity.getComponent('collisionReporter');
                            var others = collisions[guid].others;
                            var length = others.length;
                            var i = length;
                            while (i--) {
                                var other = others[i];
                                // if the contact does not exist in the current frame collisions then fire event
                                if (!frameCollisions[guid] || frameCollisions[guid].others.indexOf(other) < 0) {
                                    others.splice(i, 1);

                                    // Note: I changed the code here from PC so that it does not require the other
                                    // entity to have a collisionReporterComponent. Otherwise the end triggers
                                    // are never fired. I don't understand why this was needed in the first place...
                                    if (collisionReporterComponent && collisionReporterComponent.collisionEnd) {
                                        var flags = getCollisionFlags(entity, other);

                                        if (flags & FLAG_COLLISION_END) {
                                            collisionReporterComponent.collisionEnd.emit(other);
                                        }

                                        if (flags & FLAG_TRIGGER_LEAVE) {
                                            collisionReporterComponent.triggerLeave.emit(other);
                                        }
                                    }
                                }
                            }

                            if (others.length === 0) {
                                delete collisions[guid];
                            }
                        }
                    }
                },
                update: function(dt) {

                    this.checkCollisions();


                    // console.log(dt);
                }
            });

            return CollisionReporterSystem;
        }
    ]);
