angular
    .module('util.name-gen', [
        'util.name-gen.egyptian',
        'util.name-gen.mmo-name-set'
    ])
    .service('FantasyNameGenerator', [
        'NAMEGEN_SET_EGYPTIAN',
        'NAMEGEN_SET_MMO',
        function(NAMEGEN_SET_EGYPTIAN, NAMEGEN_SET_MMO) {
            'use strict';
            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // name_generator.js
            // written and released to the public domain by drow <drow@bin.sh>
            // http://creativecommons.org/publicdomain/zero/1.0/
            // adapted and linted into angular for Ironbane by Ben

            // TODO: change to provider and use config?
            var nameSet = {};
            nameSet.egyptian = NAMEGEN_SET_EGYPTIAN;
            nameSet.mmo = NAMEGEN_SET_MMO;

            var chainCache = {};

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // generator function

            function generateName(type) {
                var chain = markovChain(type);
                if (chain) {
                    return markovName(chain);
                }
                return '';
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // generate multiple

            function nameList(type, num) {
                var list = [];

                var i;
                for (i = 0; i < num; i++) {
                    list.push(generateName(type));
                }
                return list;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // get markov chain by type

            function markovChain(type) {
                var chain = chainCache[type];
                if (chain) {
                    return chain;
                } else {
                    var list = nameSet[type];
                    if (list) {
                        chain = constructChain(list);
                        if (chain) {
                            chainCache[type] = chain;
                            return chain;
                        }
                    }
                }
                return false;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // construct markov chain from list of names

            function constructChain(list) {
                var chain = {};

                var i;
                for (i = 0; i < list.length; i++) {
                    var names = list[i].split(/\s+/);
                    chain = incrementChain(chain, 'parts', names.length);

                    var j;
                    for (j = 0; j < names.length; j++) {
                        var name = names[j];
                        chain = incrementChain(chain, 'nameLength', name.length);

                        var c = name.substr(0, 1);
                        chain = incrementChain(chain, 'initial', c);

                        var string = name.substr(1);
                        var lastChar = c;

                        while (string.length > 0) {
                            c = string.substr(0, 1);
                            chain = incrementChain(chain, lastChar, c);

                            string = string.substr(1);
                            lastChar = c;
                        }
                    }
                }
                return scaleChain(chain);
            }

            function incrementChain(chain, key, token) {
                if (chain[key]) {
                    if (chain[key][token]) {
                        chain[key][token] ++;
                    } else {
                        chain[key][token] = 1;
                    }
                } else {
                    chain[key] = {};
                    chain[key][token] = 1;
                }
                return chain;
            }

            function scaleChain(chain) {
                var tableLength = {};

                var key;
                for (key in chain) {
                    tableLength[key] = 0;

                    var token;
                    for (token in chain[key]) {
                        var count = chain[key][token];
                        var weighted = Math.floor(Math.pow(count, 1.3));

                        chain[key][token] = weighted;
                        tableLength[key] += weighted;
                    }
                }
                chain.tableLength = tableLength;
                return chain;
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
            // construct name from markov chain

            function markovName(chain) {
                var parts = selectLink(chain, 'parts');
                var names = [];

                var i;
                for (i = 0; i < parts; i++) {
                    var nameLength = selectLink(chain, 'nameLength');
                    var c = selectLink(chain, 'initial');
                    var name = c;
                    var lastChar = c;

                    while (name.length < nameLength) {
                        c = selectLink(chain, lastChar);
                        name += c;
                        lastChar = c;
                    }
                    names.push(name);
                }
                return names.join(' ');
            }

            function selectLink(chain, key) {
                var len = chain.tableLength[key];
                var idx = Math.floor(Math.random() * len);

                var t = 0;
                for (var token in chain[key]) {
                    t += chain[key][token];
                    if (idx < t) {
                        return token;
                    }
                }
                return '-';
            }

            // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

            this.generateName = generateName;
            this.generateList = nameList;
        }
    ]);
