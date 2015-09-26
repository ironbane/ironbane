angular
    .module('game.systems.sound', [
        'howler',
        'ces',
        'engine.entity-cache'
    ])
    .provider('SoundSystem', function() {
        'use strict';

        var audioLibraryData = {};

        this.setAudioLibraryData = function(data) {
            audioLibraryData = data;
        };

        this.addAudioLibraryData = function(name, data) {
            audioLibraryData[name] = data;
        };

        this.$get = ['Howler', 'Howl', '$cacheFactory', '$log', 'System', '$entityCache', function(Howler, Howl, $cacheFactory, $log, System, $entityCache) {
            var cache = $cacheFactory('soundCache'),
                cacheKeys = [],
                soundVolume = 1,
                musicVolume = 1;

            var _getAudioConfig = function(name) {
                return audioLibraryData[name] ? audioLibraryData[name] : ($log.warn('[SoundSystem _getAudioConfig] No audio library data: ', name), null);
            };

            var _getVolume = function(name) {
                var config = _getAudioConfig(name),
                    masterVolume;
                if (!config) {
                    return 1;
                }
                switch (config.type) {
                    case 'music':
                        masterVolume = musicVolume;
                        break;
                    default:
                        masterVolume = soundVolume;
                }
                return config.volume !== undefined && (masterVolume *= config.volume);
            };

            var _load = function(name) {
                // $log.debug('[SoundSystem _load] called', name);

                if (cache.get(name)) {
                    return cache.get(name);
                }

                var config = _getAudioConfig(name);
                if (!config) {
                    return;
                }

                var files = [config.path + '.ogg', config.path + '.mp3', config.path + '.wav'],
                    volume = _getVolume(name),
                    sound = new Howl({
                        urls: files,
                        loop: config.loop,
                        buffer: config.type === 'music',
                        onload: function() {
                            this.volume(volume);
                        },
                        onloaderror: function() {
                            $log.warn('[SoundSystem _load] Failed to load: ', name);
                        }
                    });

                cacheKeys.push(name);
                cache.put(name, sound);

                return sound;
            };

            var _updateVolume = function() {
                var i, len, name, snd, vol;
                for (i = 0, len = cacheKeys.length; i < len; i++) {
                    name = cacheKeys[i];
                    snd = cache.get(name);
                    vol = _getVolume(name);

                    if (snd.volume() !== vol) {
                        snd.volume(vol);
                    }
                }
            };

            var _getSound = function(name, tryLoad) {
                if (cache.get(name)) {
                    return cache.get(name);
                }

                if (tryLoad) {
                    var sound = _load(name);
                    return sound ? sound : ($log.warn('[SoundSystem _getSound] Unable to load sound: ', name), null);
                }

                return null;
            };

            var SoundSystem = System.extend({
                init: function() {
                    this.multishotThreshold = 100;
                    this._playTimes = {};
                },
                addedToWorld: function(world) {
                    var sys = this;

                    sys._super(world);

                    world.entityAdded('sound').add(function(entity) {
                        var component = entity.getComponent('sound');

                        component.sound = _load(component.asset);

                        // $log.debug('sound entity added: ', component);

                        if (component.sound && component.is3d) {
                            component.sound.pos3d(entity.position.x, entity.position.y, entity.position.z);
                        }

                        if (component.autoPlay) {
                            sys.play(component.asset);
                        }
                    });
                },
                update: function() {
                    var system = this,
                        world = system.world,
                        entities = world.getEntities('sound');

                    entities.forEach(function(entity) {
                        var component = entity.getComponent('sound'),
                            sound = component ? component.sound : null;

                        if (sound && component.is3d) {
                            sound.pos3d(entity.position.x, entity.position.y, entity.position.z);
                        }
                    });
                },
                setSoundVolume: function(level) {
                    soundVolume = level;
                    _updateVolume();
                },
                setMusicVolume: function(level) {
                    musicVolume = level;
                    _updateVolume();
                },
                mute: function() {
                    Howler.mute();
                },
                unmute: function() {
                    Howler.unmute();
                },
                toggleMute: function() {
                    this.muted = !this.muted;
                    if (this.muted) {
                        this.mute();
                    } else {
                        this.unmute();
                    }
                },
                load: function(name) {
                    return _load(name);
                },
                play: function (name, vector3d, time) {
                    var sound = _getSound(name, true);
                    if (!sound) {
                        return;
                    }

                    var playTimes = this._playTimes,
                        lastPlayed = playTimes[name],
                        now = Date.now();

                    if (lastPlayed && now - lastPlayed < this.multishotThreshold) {
                        return;
                    }

                    playTimes[name] = now;

                    if (time) {
                        sound.pos(time);
                    }

                    var vol = _getVolume(name);

                    if (vector3d) {
                        var mainPlayer = $entityCache.get('mainPlayer');
                        if (mainPlayer) {
                            var distance = mainPlayer.position.distanceToSquared(vector3d);
                            // sound.pos3d(0, distance, 0);

                            vol *= (1.0 - Math.min(distance / (40*40), 1));
                        }

                    }

                    sound.play();
                    sound.volume(vol);
                },
                pause: function(name) {
                    var sound = _getSound(name);

                    if (!sound) {
                        return;
                    }
                    sound.pause();
                },
                stop: function(name) {
                    var sound = _getSound(name);

                    if (!sound) {
                        return;
                    }
                    sound.stop();
                },
                fadeIn: function(name, time) {
                    var sound = _getSound(name, true);

                    if (!sound) {
                        return;
                    }

                    var volume = _getVolume(name);
                    sound.play().fade(0, volume, time);
                },
                fadeOut: function(name, time) {
                    var sound = _getSound(name);

                    if (!sound) {
                        return;
                    }

                    sound.fade(sound.volume(), 0, time, function() {
                        sound.stop();
                    });
                }
            });

            return SoundSystem;
        }];

    });
