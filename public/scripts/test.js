(function () {
    var defaults = {
        speed: 2
    };

    var TestScript = function (entity, world, params) {
        this.entity = entity;
        console.log('TestScript added to ', entity.name, params);

        this.speed = (params && params.speed) || defaults.speed;
    };

    TestScript.prototype.update = function (dt, elapsed) {
        this.entity.rotation.y += Math.cos(elapsed / 1000) / 10 * this.speed;
    };

    return TestScript;
})();
