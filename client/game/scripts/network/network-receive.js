angular
	.module('game.scripts.network-receive', [
		'three',
		'components.script'
	])
	.run(function ($log, ScriptBank, THREE) {
		'use strict';

		var NetworkReceiveScript = function (entity, world) {
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
            if ( simpleRotationY < 0 ) {
                simpleRotationY += (Math.PI*2);
            }
            simpleRotationY = (Math.PI*2) - simpleRotationY;

            return simpleRotationY;
		};

		NetworkReceiveScript.prototype.update = function (dTime) {

			this.networkReceiveTimer += dTime;

			if (this.networkReceiveTimer > 1.0) {
				this.networkReceiveTimer = 0.0;

				var meteorEntity = Entities.findOne({
					_id: this.entity.meteorId,
				});

				if (meteorEntity) {
					this.desiredPosition.deserialize(meteorEntity.position);
					this.desiredRotation.deserialize(meteorEntity.rotation);
				}
			}

			// var oldy = this.entity.position.y;
			this.entity.position.lerp(this.desiredPosition, dTime*2);
			// this.entity.position.y = oldy;
			// this.entity.position.lerp(this.desiredPosition, dTime);

            var entityRotationY = toSimpleRotationY(this.entity.rotation);
            var desiredRotationY = toSimpleRotationY(this.desiredRotation);

		    var side = true;
		    if(desiredRotationY < entityRotationY) {
		      side = Math.abs(desiredRotationY - entityRotationY) < (Math.PI);
		    } else {
		      side = ((desiredRotationY - entityRotationY) > (Math.PI));
		    }

		    var distance = Math.abs(desiredRotationY - entityRotationY);

		    var speed = 2.0;

		    if( distance > 0.03 ) {
		      if (side) {
		      	this.entity.rotateY(- speed * dTime);
		      }
		      else if (!side) {
		        this.entity.rotateY(speed * dTime);
		      }
		    }

		};

		ScriptBank.add('/scripts/built-in/network-receive.js', NetworkReceiveScript);
	});
