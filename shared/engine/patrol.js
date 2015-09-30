angular
    .module('patrol', [
        'three',
        'recast',
        'engine.util',
        'util.objexporter'
    ])
    .service('Patrol', ["THREE", "Recast", "ObjExporter", "IbUtils", "$q", function (THREE, Recast, ObjExporter, IbUtils, $q) {

        var recastPromises = {};
        var path = null;

        _.extend(this, {
            buildNodes: function(zone, mesh) {

                // var deferred = $q.defer();

                // recastPromises[zone] = deferred.promise;

                // new Recast('lib/recast.js', function(recast){

                //     recast.set_cellSize(0.25);
                //     recast.set_cellHeight(0.2);
                //     recast.set_agentHeight(0.1);
                //     recast.set_agentRadius(0.2);
                //     recast.set_agentMaxClimb(4.0);
                //     recast.set_agentMaxSlope(45.0);

                //     var objContents = ObjExporter.parse(mesh);

                //     // console.log(objContents);

                //     recast.OBJDataLoader(objContents, recast.cb(function () {

                //         recast.buildSolo();

                //         // recast.buildSolo(null, recast.cb(function () {

                //             // console.log(arguments);
                //         // recastPromises[zone] = recast;

                //             // console.log('Init recast for zone ' + zone);

                //             // setInterval(function () {
                //             recast.getRandomPoint(recast.cb(function(pt1x, pt1y, pt1z) {
                //                 deferred.resolve(recast);
                //                 // alert(pt1x, pt1y, pt1z);
                //             }));
                //             // }, 5000);

                //         // }));


                //     }));

                // });

            },
            findPath: function(startPosition, targetPosition, zone, group) {
                if (!recastPromises[zone]) {
                    return $q.when(targetPosition);
                }
                return recastPromises[zone].then(function (recast) {
                    var deferred = $q.defer();

                    recast.findPath(startPosition.x,
                        startPosition.y,
                        startPosition.z,
                        targetPosition.x,
                        targetPosition.y,
                        targetPosition.z,
                        20,
                        recast.cb(function(path){
                            var threeVectorPath = path.map(function (obj) {
                                return new THREE.Vector3().copy(obj);
                            });
                            deferred.resolve(threeVectorPath);
                        }));

                    return deferred.promise;
                });
            }
        });

    }]);