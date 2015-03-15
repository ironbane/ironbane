angular
    .module('util.deepExtend', [])
    .config(function () {
        //See here: https://gist.github.com/kurtmilam/1868955
        //And here: https://github.com/pygy/underscoreDeepExtend

        function deepExtend(obj) {
            var parentRE = /#{\s*?_\s*?}/,
                slice = Array.prototype.slice,
                hasOwnProperty = Object.prototype.hasOwnProperty;

            _.each(slice.call(arguments, 1), function (source) {
                for (var prop in source) {
                    if (hasOwnProperty.call(source, prop)) {
                        if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop])) {
                            obj[prop] = source[prop];
                        } else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
                            if (_.isString(obj[prop])) {
                                obj[prop] = source[prop].replace(parentRE, obj[prop]);
                            }
                        } else if (_.isArray(obj[prop]) || _.isArray(source[prop])) {
                            if (!_.isArray(obj[prop]) || !_.isArray(source[prop])) {
                                throw 'Error: Trying to combine an array with a non-array (' + prop + ')';
                            } else {
                                obj[prop] = _.reject(_.deepExtend(obj[prop], source[prop]), function (item) {
                                    return _.isNull(item);
                                });
                            }
                        } else if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
                            if (!_.isObject(obj[prop]) || !_.isObject(source[prop])) {
                                throw 'Error: Trying to combine an object with a non-object (' + prop + ')';
                            } else {
                                obj[prop] = _.deepExtend(obj[prop], source[prop]);
                            }
                        } else {
                            obj[prop] = source[prop];
                        }
                    }
                }
            });
            return obj;
        }

        _.mixin({
            'deepExtend': deepExtend
        });
    });
