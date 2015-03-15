angular.module('engine.entity-builder', ['ces', 'three', 'engine.geometry-cache', 'engine.material-cache'])
    .service('EntityBuilder', function (Entity, THREE, $components, $geometryCache, $materialCache, $injector) {
        this.build = function (name, data) {
            var entity = new Entity(),
                transform = data.matrix || {
                    position: data.position,
                    rotation: data.rotation,
                    scale: data.scale
                };

            entity.name = name;

            if (angular.isArray(transform)) {
                var matrix = new THREE.Matrix4();
                matrix.fromArray(transform);
                matrix.decompose(entity.position, entity.quaternion, entity.scale);
            } else if (angular.isObject(transform)) {
                if (angular.isArray(transform.position)) {
                    entity.position.fromArray(transform.position);
                }
                if (angular.isArray(transform.rotation)) {
                    entity.rotation.fromArray(transform.rotation);
                }
                if (angular.isArray(transform.scale)) {
                    entity.scale.fromArray(transform.scale);
                }
            }

            angular.forEach(data.components, function(componentData, componentName) {
                entity.addComponent($components.get(componentName, componentData));
            });

            return entity;
        };

        // load from ib-entities.json export
        this.load = function (json) {
            var builder = this,
                root = new Entity();

            function parse (data, parent) {
                if(data.prefab) {
                    angular.extend(data, $injector.get(data.prefab + 'Prefab'));
                }

                // special handling for models
                // TODO: handle more of this during the original parse
                if(data.components && data.components.model) {
                    var gid = data.components.model.geometry;
                    var mid = data.components.model.material;
                    var geoData = _.findWhere(json.geometries, {uuid: gid});
                    var matData = _.findWhere(json.materials, {uuid: mid});

                    // these get cached just so other services don't have to pass the whole JSON file around
                    $geometryCache.put(gid, geoData);
                    $materialCache.put(mid, matData);
                }

                // build the entity
                var entity = builder.build(data.name, data);
                parent.add(entity);

                angular.forEach(data.children, function(child) {
                    parse(child, entity);
                });
            }

            parse(json.entities, root);

            return root;
        };
    });
