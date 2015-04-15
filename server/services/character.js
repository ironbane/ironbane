/*global Roles: true*/
angular
    .module('server.services.character', [
        'underscore',
        'global.constants'
    ])
    .service('CharacterService', [
        '_',
        '$activeWorlds',
        '$log',
        'IB_CONSTANTS',
        'EntitiesCollection',
        function(_, $activeWorlds, $log, IB_CONSTANTS, EntitiesCollection) {
            'use strict';

            this.create = function(options) {
                var user = Meteor.user();
                var validator = Meteor.npmRequire('validator');

                var charCount = EntitiesCollection.find({
                    owner: user._id
                }).count();

                if (user.profile && user.profile.guest) {
                    if (charCount >= 1) {
                        // Just return the characterId we already have on file
                        return EntitiesCollection.findOne({
                            owner: user._id
                        })._id;
                    }
                } else {
                    if (charCount >= IB_CONSTANTS.rules.maxCharactersAllowed) {
                        throw new Meteor.Error('tooManyChars', 'You\'ve reached the limit of characters you can create.');
                    }
                }

                options = options || {};

                if (!options.charName) {
                    throw new Meteor.Error('noCharNameGiven', 'Enter a character name.');
                }

                options.charName = options.charName || 'Guest';
                options.boy = !_.isUndefined(options.boy) ? options.boy : (_.random(1, 2) === 1 ? true : false);
                options.boy = options.boy ? 'male' : 'female';
                options.skin = options.skin || _.sample(IB_CONSTANTS.characterParts[options.boy].skin);
                options.eyes = options.eyes || _.sample(IB_CONSTANTS.characterParts[options.boy].eyes);
                options.hair = options.hair || _.sample(IB_CONSTANTS.characterParts[options.boy].hair);

                var charName = options.charName;

                if (!validator.isAlphanumeric(charName)) {
                    throw new Meteor.Error('charAlphanumeric', 'Character name can only have letters and numbers.');
                }

                if (!charName || charName.length < IB_CONSTANTS.rules.minCharNameLength ||
                    charName.length > IB_CONSTANTS.rules.maxCharNameLength) {
                    throw new Meteor.Error('charNameLength', 'Character name must be between ' +
                        IB_CONSTANTS.rules.minCharNameLength + ' and ' +
                        IB_CONSTANTS.rules.maxCharNameLength + ' chars.');
                }

                // Check if this character already exists
                // Note that this checks NPC's as well! We probably don't want
                // players to have the same name as an NPC.
                if (EntitiesCollection.find({
                        name: charName
                    }).count() !== 0) {
                    throw new Meteor.Error('charNameTaken', 'Character name already taken.');
                }

                if (!_.contains(IB_CONSTANTS.characterParts[options.boy].skin, options.skin) ||
                    !_.contains(IB_CONSTANTS.characterParts[options.boy].eyes, options.eyes) ||
                    !_.contains(IB_CONSTANTS.characterParts[options.boy].hair, options.hair)) {
                    throw new Meteor.Error('charAppearance', 'Invalid character appearance.');
                }

                var cheats = {};

                if (Roles.userIsInRole(user, ['game-master'])) {
                    cheats.jump = true;
                }

                var startLevel = IB_CONSTANTS.world.startLevel,
                    initialPosition = IB_CONSTANTS.world.startPosition,
                    initialRotation = IB_CONSTANTS.world.startRotation;

                if ($activeWorlds[startLevel]) {
                    // if not we have a problem!
                    var spawns = $activeWorlds[startLevel].getEntitiesCollection('spawnPoint');
                    if (spawns.length === 0) {
                        $log.log(startLevel, ' has no spawn points defined!');
                    }
                    spawns.forEach(function(spawn) {
                        var component = spawn.getComponent('spawnPoint');
                        // there should only be one of these, and maybe a better way to find it?
                        if (component.tag === 'playerStart') {
                            initialPosition = spawn.position.toArray();
                            initialRotation = spawn.rotation.toArray();
                        }
                    });
                } else {
                    $log.log('NO ACTIVE WORLD: ', startLevel);
                }

                // Insert a new character
                var entityId = EntitiesCollection.insert({
                    owner: user._id,
                    name: charName,
                    position: initialPosition,
                    rotation: initialRotation,
                    level: startLevel,
                    cheats: cheats,
                    userData: {
                        prefab: 'Character',
                        skin: options.skin,
                        eyes: options.eyes,
                        hair: options.hair,
                        charName: charName
                    }
                }, function(err) {
                    if (err) {
                        throw err;
                    }
                });

                return entityId;
            };
        }
    ])
    .run([
        'CharacterService',
        function(CharacterService) {
            'use strict';

            // here we expose any API
            Meteor.methods({
                createChar: CharacterService.create
            });
        }
    ]);
