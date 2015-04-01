onmessage = function(e) {

	var getTrianglesFromGeometry = function (geometry) {

		geometry = JSON.parse(geometry);

	    var face, i, triangles = [];
	    var vertices = geometry.vertices;

	    for ( i = 0; i < geometry.faces.length; i++ ) {
	        face = geometry.faces[i];
	        if ( !face.d ) {
	            triangles.push([
	                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
	                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
	                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z }
	            ]);
	        }
	        else {
	            triangles.push([
	                { x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
	                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
	                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
	            ]);
	            triangles.push([
	                { x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
	                { x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
	                { x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z }
	            ]);
	        }
	    }

	    return triangles;
	};

	var geometryData = e.data;

  	var result = getTrianglesFromGeometry(geometryData);

  	postMessage(result);
}
