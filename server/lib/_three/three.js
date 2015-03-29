
// The parent folder contains _ so Meteor loads the files in this folder first.

THREE = Meteor.npmRequire('three');

var roundNumber = function (number, decimals) {
	var newnumber = new Number(number+'').toFixed(parseInt(decimals)); // jshint ignore:line
	return parseFloat(newnumber);
};

THREE.Vector3.prototype.serialize = function () {
    return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
};

THREE.Euler.prototype.serialize = function () {
    return [roundNumber(this.x, 2), roundNumber(this.y, 2), roundNumber(this.z, 2)];
};

THREE.Vector3.prototype.deserialize = function (position) {
    this.x = position[0];
    this.y = position[1];
    this.z = position[2];
};

THREE.Euler.prototype.deserialize = function (rotation) {
    this.x = rotation[0];
    this.y = rotation[1];
    this.z = rotation[2];
};
