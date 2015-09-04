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

            this.create = function(options, pUser) {
                var user = pUser || Meteor.user();
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
                    var spawns = $activeWorlds[startLevel].getEntities('spawnPoint');
                    if (spawns.length === 0) {
                        $log.log(startLevel, ' has no spawn points defined!');
                    }
                    // Just pick one of them
                    // Having multiple spawns is useful against AFK players so
                    // we don't have players spawning in/on top of eachother too much.
                    (function(spawn) {
                        var component = spawn.getComponent('spawnPoint');

                        if (component.tag === 'playerStart') {
                            initialPosition = spawn.position.toArray();
                            initialRotation = spawn.rotation.toArray();
                        }
                    })(_.sample(spawns));
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
                    },
                    components: {
                        inventory: {
                            // we define these again for hasOwnProperty, a chest would not have the equipment
                            head: {name: 'Dirty Dishcloth Bandana', type: 'head', image: 1, invImage: 426, armor: 0},
                            body: null,
                            feet: null,
                            rhand: {name: 'Rusty Kitchen Knife', type: 'weapon', handedness: '1', image: 1551, damage: 1, attackCooldown: 0.5},
                            lhand: null,
                            relic1: null,
                            relic2: null,
                            relic3: null,
                            // testing...
                            slot0: {name: 'Wooden Shield', type: 'shield', image: 1138, armor: 1},
                            slot1: {name: 'Coin Sack', type: 'cash', image: 1029, qty: 2},
                            slot2: {name: 'Stinky (Poisoned) Cheese', type: 'food', damage: 2, image: 289},
                            slot3: null,
                            slot4: {name: 'Old Shoes', type: 'feet', image: 164, armor: 1},
                            slot5: {name: 'Peasant Shirt', type: 'body', image: 56, armor: 1},
                            slot6: {name: 'Ring of Elemental Power', type: 'relic', image: 1033}, // TODO: properties for powers
                            slot7: {name: 'Ritual Dagger', type: 'weapon', handedness: '1', image: 1583, damage: 4, attackCooldown: 1.5}
                        }
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
