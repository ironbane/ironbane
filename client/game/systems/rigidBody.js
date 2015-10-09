angular
    .module('game.systems.rigidBody', [
        'components',
        'ces.system',
        'three',
        'global.constants',
        'ammo',
        'ammo.physics-world',
        'game.world-root',
        'game.clientSettings'
    ])
    .factory('RigidBodySystem', [
        'System',
        'THREE',
        'Ammo',
        '$q',
        'PhysicsWorld',
        '$log',
        '$rootWorld',
        'IB_CONSTANTS',
        '$clientSettings',
        function(System, THREE, Ammo, $q, PhysicsWorld, $log, $rootWorld, IB_CONSTANTS, $clientSettings) {
            'use strict';

            // A lot of code here is based on Chandler Prall's Physijs
            // https://github.com/chandlerprall/Physijs/

            // Some is also from PlayCanvas
            // https://github.com/playcanvas/engine

            // http://bulletphysics.org/mediawiki-1.5.8/index.php/Activation_States
            var activationStates = {
                RIGIDBODY_ACTIVE_TAG: 1,
                RIGIDBODY_ISLAND_SLEEPING: 2,
                RIGIDBODY_WANTS_DEACTIVATION: 3,
                RIGIDBODY_DISABLE_DEACTIVATION: 4,
                RIGIDBODY_DISABLE_SIMULATION: 5,
            };

            // Use pre-initalized bullet vars
            // so we can reuse them
            var btVec3a = new Ammo.btVector3(0, 0, 0);
            var btVec3b = new Ammo.btVector3(0, 0, 0);
            var btVec3c = new Ammo.btVector3(0, 0, 0);
            var btQuat = new Ammo.btQuaternion(0, 0, 0, 1);
            var btTransform = new Ammo.btTransform();
            // Lazily create temp vars
            var ammoRayStart = new Ammo.btVector3();
            var ammoRayEnd = new Ammo.btVector3();

            // Cache for bullet shapes
            var objectShapes = {};
            var getShapeFromCache = function(key) {
                if (objectShapes[key] !== undefined) {
                    return objectShapes[key];
                }
                return null;
            };
            var setShapeCache = function(key, shape) {
                objectShapes[key] = shape;
            };
            var nonCachedShapes = {};

            var createShape = function(description) {
                var cacheKey, shape;

                btTransform.setIdentity();
                switch (description.type) {
                    case 'plane':
                        cacheKey = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            btVec3a.setX(description.normal.x);
                            btVec3a.setY(description.normal.y);
                            btVec3a.setZ(description.normal.z);
                            shape = new Ammo.btStaticPlaneShape(btVec3a, 0);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'box':
                        cacheKey = 'box_' + description.width + '_' + description.height + '_' + description.depth;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            btVec3a.setX(description.width / 2);
                            btVec3a.setY(description.height / 2);
                            btVec3a.setZ(description.depth / 2);
                            shape = new Ammo.btBoxShape(btVec3a);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'sphere':
                        cacheKey = 'sphere_' + description.radius;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            shape = new Ammo.btSphereShape(description.radius);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'cylinder':
                        cacheKey = 'cylinder_' + description.width + '_' + description.height + '_' + description.depth;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            btVec3a.setX(description.width / 2);
                            btVec3a.setY(description.height / 2);
                            btVec3a.setZ(description.depth / 2);
                            shape = new Ammo.btCylinderShape(btVec3a);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'capsule':
                        cacheKey = 'capsule_' + description.radius + '_' + description.height;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            // In Bullet, capsule height excludes the end spheres
                            shape = new Ammo.btCapsuleShape(description.radius, description.height - 2 * description.radius);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'cone':
                        cacheKey = 'cone_' + description.radius + '_' + description.height;
                        if ((shape = getShapeFromCache(cacheKey)) === null) {
                            shape = new Ammo.btConeShape(description.radius, description.height);
                            setShapeCache(cacheKey, shape);
                        }
                        break;

                    case 'concave':
                        var i, triangle, triangleMesh = new Ammo.btTriangleMesh();
                        if (!description.triangles.length) {
                            return false;
                        }

                        for (i = 0; i < description.triangles.length; i++) {
                            triangle = description.triangles[i];

                            btVec3a.setX(triangle[0].x);
                            btVec3a.setY(triangle[0].y);
                            btVec3a.setZ(triangle[0].z);

                            btVec3b.setX(triangle[1].x);
                            btVec3b.setY(triangle[1].y);
                            btVec3b.setZ(triangle[1].z);

                            btVec3c.setX(triangle[2].x);
                            btVec3c.setY(triangle[2].y);
                            btVec3c.setZ(triangle[2].z);

                            triangleMesh.addTriangle(
                                btVec3a,
                                btVec3b,
                                btVec3c,
                                true
                            );
                        }

                        shape = new Ammo.btBvhTriangleMeshShape(
                            triangleMesh,
                            true,
                            true
                        );
                        nonCachedShapes[description.id] = shape;
                        break;

                    case 'convex':
                        var i, point, shape = new Ammo.btConvexHullShape; // jshint ignore:line
                        for (i = 0; i < description.points.length; i++) {
                            point = description.points[i];

                            btVec3a.setX(point.x);
                            btVec3a.setY(point.y);
                            btVec3a.setZ(point.z);

                            shape.addPoint(btVec3a);
                        }
                        nonCachedShapes[description.id] = shape;
                        break;

                    case 'heightfield':

                        var ptr = Ammo.allocate(4 * description.xpts * description.ypts, 'float', Ammo.ALLOC_NORMAL);

                        for (var f = 0; f < description.points.length; f++) {
                            Ammo.setValue(ptr + f, description.points[f], 'float');
                        }

                        shape = new Ammo.btHeightfieldTerrainShape(
                            description.xpts,
                            description.ypts,
                            ptr,
                            1, -description.absMaxHeight,
                            description.absMaxHeight,
                            2,
                            0,
                            false
                        );

                        btVec3a.setX(description.xsize / (description.xpts - 1));
                        btVec3a.setY(description.ysize / (description.ypts - 1));
                        btVec3a.setZ(1);

                        shape.setLocalScaling(btVec3a);
                        nonCachedShapes[description.id] = shape;
                        break;

                    default:
                        // Not recognized
                        return;
                }

                return shape;
            };

            var calculateMeshTriangles = function(mesh) {
                var deferred = $q.defer();

                var triangles = getTrianglesFromMesh(mesh);
                deferred.resolve(triangles);

                return deferred.promise;
            };

            var getTrianglesFromMesh = function(mesh) {
                var face, i, triangles = [];
                var geometry = mesh.geometry;
                var vertices = geometry.vertices;

                for (i = 0; i < geometry.faces.length; i++) {
                    face = geometry.faces[i];
                    if (face instanceof THREE.Face3) {

                        triangles.push([{
                            x: vertices[face.a].x,
                            y: vertices[face.a].y,
                            z: vertices[face.a].z
                        }, {
                            x: vertices[face.b].x,
                            y: vertices[face.b].y,
                            z: vertices[face.b].z
                        }, {
                            x: vertices[face.c].x,
                            y: vertices[face.c].y,
                            z: vertices[face.c].z
                        }]);

                    } else if (face instanceof THREE.Face4) {

                        triangles.push([{
                            x: vertices[face.a].x,
                            y: vertices[face.a].y,
                            z: vertices[face.a].z
                        }, {
                            x: vertices[face.b].x,
                            y: vertices[face.b].y,
                            z: vertices[face.b].z
                        }, {
                            x: vertices[face.d].x,
                            y: vertices[face.d].y,
                            z: vertices[face.d].z
                        }]);
                        triangles.push([{
                            x: vertices[face.b].x,
                            y: vertices[face.b].y,
                            z: vertices[face.b].z
                        }, {
                            x: vertices[face.c].x,
                            y: vertices[face.c].y,
                            z: vertices[face.c].z
                        }, {
                            x: vertices[face.d].x,
                            y: vertices[face.d].y,
                            z: vertices[face.d].z
                        }]);

                    }
                }

                $rootWorld.scene.updateMatrixWorld();

                triangles.map(function(triangle) {
                    triangle.forEach(function(vertex) {
                        var vec = new THREE.Vector3().copy(vertex).applyMatrix4(mesh.matrixWorld);
                        vertex.x = vec.x;
                        vertex.y = vec.y;
                        vertex.z = vec.z;
                    });
                });

                return triangles;
            };

            var RigidBodySystem = System.extend({
                getBulletVec: function getBulletVec(vec) {
                    btVec3a.setValue(vec.x, vec.y, vec.z);
                    return btVec3a;
                },
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('rigidBody').add(function(entity) {
                        var rigidBodyData = entity.getComponent('rigidBody');

                        var mass = rigidBodyData.mass;

                        rigidBodyData.loadPromise = $q.when();

                        // Preprocess triangles if we are dealing with a concave mesh
                        if (rigidBodyData.shape.type === 'concave') {
                            var meshComponent = entity.getComponent('mesh');
                            if (meshComponent) {
                                //$log.debug('rigidBody meshComponent', meshComponent);
                                // Wait for the triangles to load first
                                rigidBodyData.loadPromise = meshComponent._meshLoadTask
                                    .then(function(mesh) {
                                        return calculateMeshTriangles(mesh);
                                    })
                                    .then(function(triangles) {
                                        rigidBodyData.shape.triangles = triangles;

                                        setTimeout(function() {
                                            $rootWorld.renderer.shadowMapAutoUpdate = false;
                                        }, 100);
                                    });
                            }
                        }

                        rigidBodyData.loadPromise.then(function() {
                            var shape = createShape(rigidBodyData.shape);

                            var rigidBodyInfo;
                            var rigidBody;

                            var offset = rigidBodyData.offset;

                            // TODO watch memory usage here! potential memory leak
                            // Ammo stuff must be cleaned up after use
                            btVec3a.setValue(entity.position.x + offset.x, entity.position.y + offset.y, entity.position.z + offset.z);
                            btQuat.setValue(entity.quaternion.x, entity.quaternion.y, entity.quaternion.z, entity.quaternion.w);
                            var btTransform = new Ammo.btTransform(btQuat, btVec3a);
                            var state = new Ammo.btDefaultMotionState(btTransform);

                            btVec3a.setValue(0, 0, 0);
                            if (mass !== 0) { // STATIC
                                shape.calculateLocalInertia(mass, btVec3a);
                            }
                            if (mass === 0) {
                                // $log.debug('static shape:', entity.name);
                            }
                            rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(mass, state, shape, btVec3a);

                            rigidBody = new Ammo.btRigidBody(rigidBodyInfo);

                            // rigidBody.setDamping(0.001);
                            rigidBody.setRestitution(rigidBodyData.restitution);
                            rigidBody.setFriction(rigidBodyData.friction);

                            // Keep a link to this entity for when
                            // we want collision data later
                            rigidBody.entity = entity;

                            rigidBodyData.rigidBody = rigidBody;
                            rigidBodyData.rigidBodyInfo = rigidBodyInfo;

                            if (!rigidBodyData.allowSleep) {
                                rigidBody.setActivationState(activationStates.RIGIDBODY_DISABLE_DEACTIVATION);
                            }

                            // Lock positions and rotations if set
                            var lp = rigidBodyData.lock.position;
                            btVec3a.setValue(lp.x ? 0 : 1, lp.y ? 0 : 1, lp.z ? 0 : 1);
                            rigidBody.setLinearFactor(btVec3a);

                            var lr = rigidBodyData.lock.rotation;
                            btVec3a.setValue(lr.x ? 0 : 1, lr.y ? 0 : 1, lr.z ? 0 : 1);
                            rigidBody.setAngularFactor(btVec3a);

                            if (rigidBodyData.group !== null && rigidBodyData.collidesWith !== null) {

                                var mask = 0;

                                rigidBodyData.collidesWith.forEach(function(maskName) {
                                    mask |= IB_CONSTANTS.collisionMasks[maskName];
                                })

                                PhysicsWorld.addRigidBody(rigidBody,
                                    IB_CONSTANTS.collisionMasks[rigidBodyData.group],
                                    mask);
                            } else {
                                PhysicsWorld.addRigidBody(rigidBody);
                            }

                            var lv = rigidBodyData.launchVelocity;
                            btVec3a.setValue(lv.x, lv.y, lv.z);
                            rigidBody.applyCentralImpulse(btVec3a);

                        });

                    });

                    world.entityRemoved('rigidBody').add(function(entity) {
                        var rigidBodyData = entity.getComponent('rigidBody');

                        if (rigidBodyData && rigidBodyData.rigidBody) {
                            PhysicsWorld.removeRigidBody(rigidBodyData.rigidBody);
                            Ammo.destroy(rigidBodyData.rigidBody);
                            Ammo.destroy(rigidBodyData.rigidBodyInfo);
                        }
                    });

                },
                // This native ammojs raycast function wworks but it only works by raycasting every object in the scene,
                // and we don't seem to have support to filter out some entities.
                // This is because AllHitsRayResultCallback is not implemented yet in Ammojs so we
                // need to have our own raycast solution. threeoctree worked very well in old IB
                // so we'll use that instead

                rayCast: function(start, end, name, callback) {

                    var vecEndWorldSpace = start.clone().add(end.clone().multiplyScalar(100));

                    ammoRayStart.setValue(start.x, start.y, start.z);
                    ammoRayEnd.setValue(vecEndWorldSpace.x, vecEndWorldSpace.y, vecEndWorldSpace.z);
                    var rayCallback = new Ammo.ClosestRayResultCallback(ammoRayStart, ammoRayEnd);

                    // var filterGroup = rayCallback.get_m_collisionFilterGroup();
                    // console.log(filterGroup);

                    rayCallback.set_m_collisionFilterGroup(2);

                    // var filterGroup = rayCallback.get_m_collisionFilterGroup();
                    // console.log(filterGroup);

                    PhysicsWorld.rayTest(ammoRayStart, ammoRayEnd, rayCallback);
                    if (rayCallback.hasHit()) {
                        var collisionObjPtr = rayCallback.get_m_collisionObject(); // jshint ignore:line
                        var collisionObj = Ammo.wrapPointer(collisionObjPtr, Ammo.btCollisionObject);
                        var body = Ammo.castObject(collisionObj, Ammo.btRigidBody);
                        var point = rayCallback.get_m_hitPointWorld(); // jshint ignore:line
                        var normal = rayCallback.get_m_hitNormalWorld(); // jshint ignore:line

                        // var ammoRayStartVec = new THREE.Vector3(ammoRayStart.x(), ammoRayStart.y(), ammoRayStart.z())
                        // var ammoRayEndVec = new THREE.Vector3(ammoRayEnd.x(), ammoRayEnd.y(), ammoRayEnd.z())
                        // console.log(ammoRayStartVec, ammoRayEndVec);

                        var pointVec = new THREE.Vector3(point.x(), point.y(), point.z())
                        var normalVec = new THREE.Vector3(normal.x(), normal.y(), normal.z());

                        if (body) {
                            callback([{
                                entity: body.entity,
                                point: pointVec,
                                normal: normalVec
                            }]);
                        }
                    } else {
                        callback([]);
                    }

                    Ammo.destroy(rayCallback);
                },
                // getInfo: function(entity) {
                //     var rigidBodyComponent = entity.getComponent('rigidBody');

                //     if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                //         var body = rigidBodyComponent.rigidBody;
                //         var motionState = body.getMotionState();
                //         // if (motionState) { // STATIC (or mass === 0) should not have this! but it does...
                //             var trans = new Ammo.btTransform();
                //             motionState.getWorldTransform(trans);

                //             var pos = trans.getOrigin();
                //             var rot = trans.getRotation();

                //             var pos = new THREE.Vector3().set(pos.x(), pos.y(), pos.z());
                //             var quat = new THREE.Quaternion().set(rot.x(), rot.y(), rot.z(), rot.w());

                //             Ammo.destroy(trans);

                //             return {
                //                 pos: pos,
                //                 quat: quat,
                //             }
                //         // }
                //     }
                // },
                syncEntities: function() {
                    var rigidBodies = this.world.getEntities('rigidBody');

                    rigidBodies.forEach(function(entity) {
                        var rigidBodyComponent = entity.getComponent('rigidBody');

                        if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                            var body = rigidBodyComponent.rigidBody;
                            var motionState = body.getMotionState();
                            if (motionState && rigidBodyComponent.mass !== 0) { // STATIC (or mass === 0) should not have this! but it does...
                                motionState.getWorldTransform(btTransform);

                                var pos = btTransform.getOrigin();
                                entity.position.set(pos.x(), pos.y(), pos.z());

                                if (!rigidBodyComponent.lock.rotation.x && !rigidBodyComponent.lock.rotation.y && !rigidBodyComponent.lock.rotation.z) {
                                    var rot = btTransform.getRotation();
                                    entity.quaternion.set(rot.x(), rot.y(), rot.z(), rot.w());
                                }
                            }
                        }
                    });
                },
                applyCentralImpulse: function(entity, impulse) {
                    btVec3a.setValue(impulse.x, impulse.y, impulse.z);
                    var rigidBodyComponent = entity.getComponent('rigidBody');
                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        rigidBodyComponent.rigidBody.applyCentralImpulse(btVec3a);
                    }
                },
                setLinearVelocity: function(entity, vel) {
                    btVec3a.setValue(vel.x, vel.y, vel.z);
                    var rigidBodyComponent = entity.getComponent('rigidBody');
                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        rigidBodyComponent.rigidBody.setLinearVelocity(btVec3a);
                    }
                },
                syncBody: function(entity) { // this will move the rigidbody based on a set value like from network
                    var rigidBodyComponent = entity.getComponent('rigidBody');

                    if (rigidBodyComponent && rigidBodyComponent.rigidBody) {
                        var body = rigidBodyComponent.rigidBody;
                        var transform = body.getWorldTransform();

                        transform.getOrigin().setValue(entity.position.x, entity.position.y, entity.position.z);
                        btQuat.setValue(entity.quaternion.x, entity.quaternion.y, entity.quaternion.z, entity.quaternion.w);
                        transform.setRotation(btQuat);

                        body.activate();
                    }
                },
                update: function(dt) {
                    if ($clientSettings.get('isAdminPanelOpen')) {
                        return;
                    }

                    PhysicsWorld.stepSimulation(dt * 2, 7);

                    this.syncEntities();
                }
            });

            return RigidBodySystem;
        }
    ]);
