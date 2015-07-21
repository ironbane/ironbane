/*!
 * ng-di - v0.1.0 - 2013-04-06
 * Dependency Injection for Javascript. Both for Browser and Node
 * https://github.com/jmendiara/ng-di
 * Adaptation done 2013 Javier Mendiara Cañardo
 * Licensed MIT
 * https://github.com/jmendiara/ng-di/blob/master/LICENSE-MIT
 *
 * All credits must go to the AngularJS team.
 * AngularJS Licensed under MIT License.
*/

(function(window, undefined) {


function require(moduleName) {
  var whereToStart = moduleName.lastIndexOf('/'), name;

  if (whereToStart === -1){
    throw new Error('Module "' + moduleName + '" not found');
  }
  name = moduleName.substr(whereToStart + 1);

  return require.modules[name] || (require.modules[name] = {});
};

require.modules = {};

window.di = require('./ng-di');

(function (exports) {
  'use strict';

  var uid = ['0', '0', '0'];


  ////////////////////////////////////

  /**
   * @ngdoc function
   * @name angular.forEach
   * @function
   *
   * @description
   * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
   * object or an array. The `iterator` function is invoked with `iterator(value, key)`, where `value`
   * is the value of an object property or an array element and `key` is the object property key or
   * array element index. Specifying a `context` for the function is optional.
   *
   * Note: this function was previously known as `angular.foreach`.
   *
   <pre>
   var values = {name: 'misko', gender: 'male'};
   var log = [];
   angular.forEach(values, function(value, key){
       this.push(key + ': ' + value);
     }, log);
   expect(log).toEqual(['name: misko', 'gender:male']);
   </pre>
   *
   * @param {Object|Array} obj Object to iterate over.
   * @param {Function} iterator Iterator function.
   * @param {Object=} context Object to become context (`this`) for the iterator function.
   * @returns {Object|Array} Reference to `obj`.
   */


  /**
   * @private
   * @param {*} obj
   * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments, ...)
   */
  function isArrayLike(obj) {
    if (!obj || (typeof obj.length !== 'number')) return false;

    // We have on object which has length property. Should we treat it as array?
    if (typeof obj.hasOwnProperty != 'function' &&
      typeof obj.constructor != 'function') {
      // This is here for IE8: it is a bogus object treat it as array;
      return true;
    } else {
      return Object.prototype.toString.call(obj) !== '[object Object]' ||   // some browser native object
        typeof obj.callee === 'function';              // arguments (on IE8 looks like regular obj)
    }
  }


  function forEach(obj, iterator, context) {
    var key;
    if (obj) {
      if (isFunction(obj)) {
        for (key in obj) {
          if (key != 'prototype' && key != 'length' && key != 'name' && obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      } else if (obj.forEach && obj.forEach !== forEach) {
        obj.forEach(iterator, context);
      } else if (isArrayLike(obj)) {
        for (key = 0; key < obj.length; key++){
          iterator.call(context, obj[key], key);
        }
      } else {
        for (key in obj) {
          if (obj.hasOwnProperty(key)) {
            iterator.call(context, obj[key], key);
          }
        }
      }
    }
    return obj;
  };

  /**
   * @ngdoc function
   * @name angular.extend
   * @function
   *
   * @description
   * Extends the destination object `dst` by copying all of the properties from the `src` object(s)
   * to `dst`. You can specify multiple `src` objects.
   *
   * @param {Object} dst Destination object.
   * @param {...Object} src Source object(s).
   */
  function extend(dst) {
    forEach(arguments, function(obj){
      if (obj !== dst) {
        forEach(obj, function(value, key){
          dst[key] = value;
        });
      }
    });
    return dst;
  }


  /**
   * when using forEach the params are value, key, but it is often useful to have key, value.
   * @param {function(string, *)} iteratorFn
   * @returns {function(*, string)}
   */
  function reverseParams(iteratorFn) {
    return function(value, key) {
      iteratorFn(key, value)
    };
  }


  /**
   * A consistent way of creating unique IDs in angular. The ID is a sequence of alpha numeric
   * characters such as '012ABC'. The reason why we are not using simply a number counter is that
   * the number string gets longer over time, and it can also overflow, where as the nextId
   * will grow much slower, it is a string, and it will never overflow.
   *
   * @returns an unique alpha-numeric string
   */
  function nextUid() {
    var index = uid.length;
    var digit;

    while (index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57 /*'9'*/) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90  /*'Z'*/) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  };

  function valueFn(value) {
    return function () {
      return value;
    };
  };

  /**
   * @ngdoc function
   * @name angular.isObject
   * @function
   *
   * @description
   * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
   * considered to be objects.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Object` but not `null`.
   */
  function isObject(value) {
    return value != null && typeof value == 'object';
  };


  /**
   * @ngdoc function
   * @name angular.isString
   * @function
   *
   * @description
   * Determines if a reference is a `String`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `String`.
   */
  function isString(value) {
    return typeof value == 'string';
  };


  /**
   * @ngdoc function
   * @name angular.isArray
   * @function
   *
   * @description
   * Determines if a reference is an `Array`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is an `Array`.
   */
  function isArray(value) {
    return Object.prototype.toString.apply(value) == '[object Array]';
  };


  /**
   * @ngdoc function
   * @name angular.isFunction
   * @function
   *
   * @description
   * Determines if a reference is a `Function`.
   *
   * @param {*} value Reference to check.
   * @returns {boolean} True if `value` is a `Function`.
   */
  function isFunction(value) {
    return typeof value == 'function';
  };



  /**
   * throw error of the argument is falsy.
   */
  function assertArg(arg, name, reason) {
    if (!arg) {
      throw new Error("Argument '" + (name || '?') + "' is " + (reason || "required"));
    }
    return arg;
  };

  function assertArgFn(arg, name, acceptArrayAnnotation) {
    if (acceptArrayAnnotation && isArray(arg)) {
      arg = arg[arg.length - 1];
    }

    assertArg(isFunction(arg), name, 'not a function, got ' +
      (arg && typeof arg == 'object' ? arg.constructor.name || 'Object' : typeof arg));
    return arg;
  };

  exports.forEach = forEach;
  exports.reverseParams = reverseParams;
  exports.extend = extend;
  exports.nextUid = nextUid;
  exports.assertArgFn = assertArgFn;
  exports.valueFn = valueFn;
  exports.isString = isString;
  exports.isArray = isArray;
  exports.isFunction = isFunction;
  exports.isObject = isObject;

})(typeof exports === 'undefined' ? require('./utils') : exports);

(function(exports) {
  'use strict';

  exports.setupModuleLoader = function setupModuleLoader(where) {

    function ensure(obj, name, factory) {
      return obj[name] || (obj[name] = factory());
    }

    return ensure(where, 'module', function() {
      /** @type {Object.<string, angular.Module>} */
      var modules = {};

      /**
       * @ngdoc function
       * @name angular.module
       * @description
       *
       * The `angular.module` is a global place for creating and registering Angular modules. All
       * modules (angular core or 3rd party) that should be available to an application must be
       * registered using this mechanism.
       *
       *
       * # Module
       *
       * A module is a collocation of services, directives, filters, and configuration information. Module
       * is used to configure the {@link AUTO.$injector $injector}.
       *
       * <pre>
       * // Create a new module
       * var myModule = angular.module('myModule', []);
       *
       * // register a new service
       * myModule.value('appName', 'MyCoolApp');
       *
       * // configure existing services inside initialization blocks.
       * myModule.config(function($locationProvider) {
       *   // Configure existing providers
       *   $locationProvider.hashPrefix('!');
       * });
       * </pre>
       *
       * Then you can create an injector and load your modules like this:
       *
       * <pre>
       * var injector = angular.injector(['ng', 'MyModule'])
       * </pre>
       *
       * However it's more likely that you'll just use
       * {@link ng.directive:ngApp ngApp} or
       * {@link angular.bootstrap} to simplify this process for you.
       *
       * @param {!string} name The name of the module to create or retrieve.
       * @param {Array.<string>=} requires If specified then new module is being created. If unspecified then the
       *        the module is being retrieved for further configuration.
       * @param {Function} configFn Optional configuration function for the module. Same as
       *        {@link angular.Module#config Module#config()}.
       * @returns {module} new module with the {@link angular.Module} api.
       */
      return function module(name, requires, configFn) {
        if (requires && modules.hasOwnProperty(name)) {
          modules[name] = null;
        }
        return ensure(modules, name, function() {
          if (!requires) {
            throw Error('No module: ' + name);
          }

          /** @type {!Array.<Array.<*>>} */
          var invokeQueue = [];

          /** @type {!Array.<Function>} */
          var runBlocks = [];

          var config = invokeLater('$injector', 'invoke');

          /** @type {angular.Module} */
          var moduleInstance = {
            // Private state
            _invokeQueue: invokeQueue,
            _runBlocks: runBlocks,

            /**
             * @ngdoc property
             * @name angular.Module#requires
             * @propertyOf angular.Module
             * @returns {Array.<string>} List of module names which must be loaded before this module.
             * @description
             * Holds the list of modules which the injector will load before the current module is loaded.
             */
            requires: requires,

            /**
             * @ngdoc property
             * @name angular.Module#name
             * @propertyOf angular.Module
             * @returns {string} Name of the module.
             * @description
             */
            name: name,


            /**
             * @ngdoc method
             * @name angular.Module#provider
             * @methodOf angular.Module
             * @param {string} name service name
             * @param {Function} providerType Construction function for creating new instance of the service.
             * @description
             * See {@link AUTO.$provide#provider $provide.provider()}.
             */
            provider: invokeLater('$provide', 'provider'),

            /**
             * @ngdoc method
             * @name angular.Module#factory
             * @methodOf angular.Module
             * @param {string} name service name
             * @param {Function} providerFunction Function for creating new instance of the service.
             * @description
             * See {@link AUTO.$provide#factory $provide.factory()}.
             */
            factory: invokeLater('$provide', 'factory'),

            /**
             * @ngdoc method
             * @name angular.Module#service
             * @methodOf angular.Module
             * @param {string} name service name
             * @param {Function} constructor A constructor function that will be instantiated.
             * @description
             * See {@link AUTO.$provide#service $provide.service()}.
             */
            service: invokeLater('$provide', 'service'),

            /**
             * @ngdoc method
             * @name angular.Module#value
             * @methodOf angular.Module
             * @param {string} name service name
             * @param {*} object Service instance object.
             * @description
             * See {@link AUTO.$provide#value $provide.value()}.
             */
            value: invokeLater('$provide', 'value'),

            /**
             * @ngdoc method
             * @name angular.Module#constant
             * @methodOf angular.Module
             * @param {string} name constant name
             * @param {*} object Constant value.
             * @description
             * Because the constant are fixed, they get applied before other provide methods.
             * See {@link AUTO.$provide#constant $provide.constant()}.
             */
            constant: invokeLater('$provide', 'constant', 'unshift'),

            /**
             * @ngdoc method
             * @name angular.Module#config
             * @methodOf angular.Module
             * @param {Function} configFn Execute this function on module load. Useful for service
             *    configuration.
             * @description
             * Use this method to register work which needs to be performed on module loading.
             */
            config: config,

            /**
             * @ngdoc method
             * @name angular.Module#run
             * @methodOf angular.Module
             * @param {Function} initializationFn Execute this function after injector creation.
             *    Useful for application initialization.
             * @description
             * Use this method to register work which should be performed when the injector is done
             * loading all modules.
             */
            run: function(block) {
              runBlocks.push(block);
              return this;
            }
          };

          if (configFn) {
            config(configFn);
          }

          return  moduleInstance;

          /**
           * @param {string} provider
           * @param {string} method
           * @param {String=} insertMethod
           * @returns {angular.Module}
           */
          function invokeLater(provider, method, insertMethod) {
            return function() {
              invokeQueue[insertMethod || 'push']([provider, method, arguments]);
              return moduleInstance;
            }
          }
        });
      };
    });

  }
})(typeof exports === 'undefined'? require('./module') : exports);

(function (exports) {
  'use strict';

  var utils = require('./utils');

  /**
   * Computes a hash of an 'obj'.
   * Hash of a:
   *  string is string
   *  number is number as string
   *  object is either result of calling $$hashKey function on the object or uniquely generated id,
   *         that is also assigned to the $$hashKey property of the object.
   *
   * @param obj
   * @returns {string} hash string such that the same input will have the same hash string.
   *         The resulting string key is in 'type:hashKey' format.
   */
  var hashKey = function hashKey(obj) {
    var objType = typeof obj,
      key;

    if (objType === 'object' && obj !== null) {
      if (typeof (key = obj.$$hashKey) === 'function') {
        // must invoke on object to keep the right this
        key = obj.$$hashKey();
      } else if (key === undefined) {
        key = obj.$$hashKey = utils.nextUid();
      }
    } else {
      key = obj;
    }

    return objType + ':' + key;
  };

  /**
   * HashMap which can use objects as keys
   */
  exports.HashMap = function HashMap(array) {
    utils.forEach(array, this.put, this);
  };

  exports.HashMap.prototype = {
    /**
     * Store key value pair
     * @param key key to store can be any type
     * @param value value to store can be any type
     */
    put: function (key, value) {
      this[hashKey(key)] = value;
    },

    /**
     * @param key
     * @returns the value for the key
     */
    get: function (key) {
      return this[hashKey(key)];
    },

    /**
     * Remove the key/value pair
     * @param key
     */
    remove: function (key) {
      var value = this[key = hashKey(key)];
      delete this[key];
      return value;
    }
  };

})(typeof exports === 'undefined'? require('./hashmap') : exports);

(function (exports) {
  'use strict';



  var hash = require('./hashmap'),
    utils = require('./utils'),
    di = require('./ng-di');

  /**
   * @ngdoc function
   * @name angular.injector
   * @function
   *
   * @description
   * Creates an injector function that can be used for retrieving services as well as for
   * dependency injection (see {@link guide/di dependency injection}).
   *

   * @param {Array.<string|Function>} modules A list of module functions or their aliases. See
   *        {@link angular.module}. The `ng` module must be explicitly added.
   * @returns {function()} Injector function. See {@link AUTO.$injector $injector}.
   *
   * @example
   * Typical usage
   * <pre>
   *   // create an injector
   *   var $injector = angular.injector(['ng']);
   *
   *   // use the injector to kick off your application
   *   // use the type inference to auto inject arguments, or use implicit injection
   *   $injector.invoke(function($rootScope, $compile, $document){
   *     $compile($document)($rootScope);
   *     $rootScope.$digest();
   *   });
   * </pre>
   */


  /**
   * @ngdoc overview
   * @name AUTO
   * @description
   *
   * Implicit module which gets automatically added to each {@link AUTO.$injector $injector}.
   */

  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  var FN_ARG_SPLIT = /,/;
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;


  var annotate = exports.annotate = function annotate(fn) {
    var $inject,
      fnText,
      argDecl,
      last;

    if (typeof fn === 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];
        fnText = fn.toString().replace(STRIP_COMMENTS, '');
        argDecl = fnText.match(FN_ARGS);
        utils.forEach(argDecl[1].split(FN_ARG_SPLIT), function (arg) {
          arg.replace(FN_ARG, function (all, underscore, name) {
            $inject.push(name);
          });
        });
        fn.$inject = $inject;
      }
    } else if (utils.isArray(fn)) {
      last = fn.length - 1;
      utils.assertArgFn(fn[last], 'fn');
      $inject = fn.slice(0, last);
    } else {
      utils.assertArgFn(fn, 'fn', true);
    }
    return $inject;
  };

///////////////////////////////////////

  /**
   * @ngdoc object
   * @name AUTO.$injector
   * @function
   *
   * @description
   *
   * `$injector` is used to retrieve object instances as defined by
   * {@link AUTO.$provide provider}, instantiate types, invoke methods,
   * and load modules.
   *
   * The following always holds true:
   *
   * <pre>
   *   var $injector = angular.injector();
   *   expect($injector.get('$injector')).toBe($injector);
   *   expect($injector.invoke(function($injector){
   *     return $injector;
   *   }).toBe($injector);
   * </pre>
   *
   * # Injection Function Annotation
   *
   * JavaScript does not have annotations, and annotations are needed for dependency injection. The
   * following ways are all valid way of annotating function with injection arguments and are equivalent.
   *
   * <pre>
   *   // inferred (only works if code not minified/obfuscated)
   *   $injector.invoke(function(serviceA){});
   *
   *   // annotated
   *   function explicit(serviceA) {};
   *   explicit.$inject = ['serviceA'];
   *   $injector.invoke(explicit);
   *
   *   // inline
   *   $injector.invoke(['serviceA', function(serviceA){}]);
   * </pre>
   *
   * ## Inference
   *
   * In JavaScript calling `toString()` on a function returns the function definition. The definition can then be
   * parsed and the function arguments can be extracted. *NOTE:* This does not work with minification, and obfuscation
   * tools since these tools change the argument names.
   *
   * ## `$inject` Annotation
   * By adding a `$inject` property onto a function the injection parameters can be specified.
   *
   * ## Inline
   * As an array of injection names, where the last item in the array is the function to call.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#get
   * @methodOf AUTO.$injector
   *
   * @description
   * Return an instance of the service.
   *
   * @param {string} name The name of the instance to retrieve.
   * @return {*} The instance.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#invoke
   * @methodOf AUTO.$injector
   *
   * @description
   * Invoke the method and supply the method arguments from the `$injector`.
   *
   * @param {!function} fn The function to invoke. The function arguments come form the function annotation.
   * @param {Object=} self The `this` for the invoked method.
   * @param {Object=} locals Optional object. If preset then any argument names are read from this object first, before
   *   the `$injector` is consulted.
   * @returns {*} the value returned by the invoked `fn` function.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#instantiate
   * @methodOf AUTO.$injector
   * @description
   * Create a new instance of JS type. The method takes a constructor function invokes the new operator and supplies
   * all of the arguments to the constructor function as specified by the constructor annotation.
   *
   * @param {function} Type Annotated constructor function.
   * @param {Object=} locals Optional object. If preset then any argument names are read from this object first, before
   *   the `$injector` is consulted.
   * @returns {Object} new instance of `Type`.
   */

  /**
   * @ngdoc method
   * @name AUTO.$injector#annotate
   * @methodOf AUTO.$injector
   *
   * @description
   * Returns an array of service names which the function is requesting for injection. This API is used by the injector
   * to determine which services need to be injected into the function when the function is invoked. There are three
   * ways in which the function can be annotated with the needed dependencies.
   *
   * # Argument names
   *
   * The simplest form is to extract the dependencies from the arguments of the function. This is done by converting
   * the function into a string using `toString()` method and extracting the argument names.
   * <pre>
   *   // Given
   *   function MyController($scope, $route) {
   *     // ...
   *   }
   *
   *   // Then
   *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
   * </pre>
   *
   * This method does not work with code minfication / obfuscation. For this reason the following annotation strategies
   * are supported.
   *
   * # The `$inject` property
   *
   * If a function has an `$inject` property and its value is an array of strings, then the strings represent names of
   * services to be injected into the function.
   * <pre>
   *   // Given
   *   var MyController = function(obfuscatedScope, obfuscatedRoute) {
   *     // ...
   *   }
   *   // Define function dependencies
   *   MyController.$inject = ['$scope', '$route'];
   *
   *   // Then
   *   expect(injector.annotate(MyController)).toEqual(['$scope', '$route']);
   * </pre>
   *
   * # The array notation
   *
   * It is often desirable to inline Injected functions and that's when setting the `$inject` property is very
   * inconvenient. In these situations using the array notation to specify the dependencies in a way that survives
   * minification is a better choice:
   *
   * <pre>
   *   // We wish to write this (not minification / obfuscation safe)
   *   injector.invoke(function($compile, $rootScope) {
   *     // ...
   *   });
   *
   *   // We are forced to write break inlining
   *   var tmpFn = function(obfuscatedCompile, obfuscatedRootScope) {
   *     // ...
   *   };
   *   tmpFn.$inject = ['$compile', '$rootScope'];
   *   injector.invoke(tempFn);
   *
   *   // To better support inline function the inline annotation is supported
   *   injector.invoke(['$compile', '$rootScope', function(obfCompile, obfRootScope) {
   *     // ...
   *   }]);
   *
   *   // Therefore
   *   expect(injector.annotate(
   *      ['$compile', '$rootScope', function(obfus_$compile, obfus_$rootScope) {}])
   *    ).toEqual(['$compile', '$rootScope']);
   * </pre>
   *
   * @param {function|Array.<string|Function>} fn Function for which dependent service names need to be retrieved as described
   *   above.
   *
   * @returns {Array.<string>} The names of the services which the function requires.
   */


  /**
   * @ngdoc object
   * @name AUTO.$provide
   *
   * @description
   *
   * Use `$provide` to register new providers with the `$injector`. The providers are the factories for the instance.
   * The providers share the same name as the instance they create with `Provider` suffixed to them.
   *
   * A provider is an object with a `$get()` method. The injector calls the `$get` method to create a new instance of
   * a service. The Provider can have additional methods which would allow for configuration of the provider.
   *
   * <pre>
   *   function GreetProvider() {
   *     var salutation = 'Hello';
   *
   *     this.salutation = function(text) {
   *       salutation = text;
   *     };
   *
   *     this.$get = function() {
   *       return function (name) {
   *         return salutation + ' ' + name + '!';
   *       };
   *     };
   *   }
   *
   *   describe('Greeter', function(){
   *
   *     beforeEach(module(function($provide) {
   *       $provide.provider('greet', GreetProvider);
   *     });
   *
   *     it('should greet', inject(function(greet) {
   *       expect(greet('angular')).toEqual('Hello angular!');
   *     }));
   *
   *     it('should allow configuration of salutation', function() {
   *       module(function(greetProvider) {
   *         greetProvider.salutation('Ahoj');
   *       });
   *       inject(function(greet) {
   *         expect(greet('angular')).toEqual('Ahoj angular!');
   *       });
   *     )};
   *
   *   });
   * </pre>
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#provider
   * @methodOf AUTO.$provide
   * @description
   *
   * Register a provider for a service. The providers can be retrieved and can have additional configuration methods.
   *
   * @param {string} name The name of the instance. NOTE: the provider will be available under `name + 'Provider'` key.
   * @param {(Object|function())} provider If the provider is:
   *
   *   - `Object`: then it should have a `$get` method. The `$get` method will be invoked using
   *               {@link AUTO.$injector#invoke $injector.invoke()} when an instance needs to be created.
   *   - `Constructor`: a new instance of the provider will be created using
   *               {@link AUTO.$injector#instantiate $injector.instantiate()}, then treated as `object`.
   *
   * @returns {Object} registered provider instance
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#factory
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for configuring services if only `$get` method is required.
   *
   * @param {string} name The name of the instance.
   * @param {function()} $getFn The $getFn for the instance creation. Internally this is a short hand for
   * `$provide.provider(name, {$get: $getFn})`.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#service
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for registering service of given class.
   *
   * @param {string} name The name of the instance.
   * @param {Function} constructor A class (constructor function) that will be instantiated.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#value
   * @methodOf AUTO.$provide
   * @description
   *
   * A short hand for configuring services if the `$get` method is a constant.
   *
   * @param {string} name The name of the instance.
   * @param {*} value The value.
   * @returns {Object} registered provider instance
   */


  /**
   * @ngdoc method
   * @name AUTO.$provide#constant
   * @methodOf AUTO.$provide
   * @description
   *
   * A constant value, but unlike {@link AUTO.$provide#value value} it can be injected
   * into configuration function (other modules) and it is not interceptable by
   * {@link AUTO.$provide#decorator decorator}.
   *
   * @param {string} name The name of the constant.
   * @param {*} value The constant value.
   * @returns {Object} registered instance
   */

  /**
   * @ngdoc method
   * @name AUTO.$provide#decorator
   * @methodOf AUTO.$provide
   * @description
   *
   * Decoration of service, allows the decorator to intercept the service instance creation. The
   * returned instance may be the original instance, or a new instance which delegates to the
   * original instance.
   *
   * @param {string} name The name of the service to decorate.
   * @param {function()} decorator This function will be invoked when the service needs to be
   *    instanciated. The function is called using the {@link AUTO.$injector#invoke
   *    injector.invoke} method and is therefore fully injectable. Local injection arguments:
   *
   *    * `$delegate` - The original service instance, which can be monkey patched, configured,
   *      decorated or delegated to.
   */


  exports.createInjector = function createInjector(modulesToLoad) {



    ////////////////////////////////////
    // $provider
    ////////////////////////////////////

    function supportObject(delegate) {
      return function supportObjectInternal(key, value) {
        if (utils.isObject(key)) {
          utils.forEach(key, utils.reverseParams(delegate));
        } else {
          return delegate(key, value);
        }
      };
    }

    function provider(name, provider_) {
      if (utils.isFunction(provider_) || utils.isArray(provider_)) {
        provider_ = providerInjector.instantiate(provider_);
      }
      if (!provider_.$get) {
        throw new Error('Provider ' + name + ' must define $get factory method.');
      }
      return providerCache[name + providerSuffix] = provider_;
    }

    function factory(name, factoryFn) {
      return provider(name, { $get: factoryFn });
    }

    function service(name, constructor) {
      return factory(name, ['$injector', function ($injector) {
        return $injector.instantiate(constructor);
      }]);
    }

    function value(name, valuep) {
      return factory(name, utils.valueFn(valuep));
    }

    function constant(name, value) {
      providerCache[name] = value;
      instanceCache[name] = value;
    }

    function decorator(serviceName, decorFn) {
      var origProvider = providerInjector.get(serviceName + providerSuffix),
        orig$get = origProvider.$get;

      origProvider.$get = function () {
        var origInstance = instanceInjector.invoke(orig$get, origProvider);
        return instanceInjector.invoke(decorFn, null, {$delegate: origInstance});
      };
    }

    ////////////////////////////////////
    // Module Loading
    ////////////////////////////////////
    function loadModules(modulesToLoad) {
      var runBlocks = [];
      utils.forEach(modulesToLoad, function (module) {
        if (loadedModules.get(module)) {
          return;
        }
        loadedModules.put(module, true);
        if (utils.isString(module)) {
          var moduleFn = di.module(module);
          runBlocks = runBlocks.concat(loadModules(moduleFn.requires)).concat(moduleFn._runBlocks);

          try {
            for (var invokeQueue = moduleFn._invokeQueue, i = 0, ii = invokeQueue.length; i < ii; i++) {
              var invokeArgs = invokeQueue[i],
                provider = providerInjector.get(invokeArgs[0]);

              provider[invokeArgs[1]].apply(provider, invokeArgs[2]);
            }
          } catch (e) {
            if (e.message) {
              e.message += ' from ' + module;
            }
            throw e;
          }
        } else if (utils.isFunction(module)) {
          try {
            runBlocks.push(providerInjector.invoke(module));
          } catch (e) {
            if (e.message) {
              e.message += ' from ' + module;
            }
            throw e;
          }
        } else if (utils.isArray(module)) {
          try {
            runBlocks.push(providerInjector.invoke(module));
          } catch (e) {
            if (e.message) {
              e.message += ' from ' + String(module[module.length - 1]);
            }
            throw e;
          }
        } else {
          utils.assertArgFn(module, 'module');
        }
      });
      return runBlocks;
    }

    ////////////////////////////////////
    // internal Injector
    ////////////////////////////////////

    function createInternalInjector(cache, factory) {

      function getService(serviceName) {
        if (typeof serviceName !== 'string') {
          throw new Error('Service name expected');
        }
        if (cache.hasOwnProperty(serviceName)) {
          if (cache[serviceName] === INSTANTIATING) {
            throw new Error('Circular dependency: ' + path.join(' <- '));
          }
          return cache[serviceName];
        } else {
          try {
            path.unshift(serviceName);
            cache[serviceName] = INSTANTIATING;
            return cache[serviceName] = factory(serviceName);
          } finally {
            path.shift();
          }
        }
      }

      function invoke(fn, self, locals) {
        var args = [],
          $inject = annotate(fn),
          length, i,
          key;

        for (i = 0, length = $inject.length; i < length; i++) {
          key = $inject[i];
          args.push(
            locals && locals.hasOwnProperty(key) ?
              locals[key] :
              getService(key)
          );
        }
        if (!fn.$inject) {
          // this means that we must be an array.
          fn = fn[length];
        }


        // Performance optimization: http://jsperf.com/apply-vs-call-vs-invoke
        switch (self ? -1 : args.length) {
          case  0:
            return fn();
          case  1:
            return fn(args[0]);
          case  2:
            return fn(args[0], args[1]);
          case  3:
            return fn(args[0], args[1], args[2]);
          case  4:
            return fn(args[0], args[1], args[2], args[3]);
          case  5:
            return fn(args[0], args[1], args[2], args[3], args[4]);
          case  6:
            return fn(args[0], args[1], args[2], args[3], args[4], args[5]);
          case  7:
            return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          case  8:
            return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
          case  9:
            return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
          case 10:
            return fn(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
          default:
            return fn.apply(self, args);
        }
      }

      function instantiate(Type, locals) {
        var Constructor = function () {
          },
          instance, returnedValue;

        Constructor.prototype = (utils.isArray(Type) ? Type[Type.length - 1] : Type).prototype;
        instance = new Constructor();
        returnedValue = invoke(Type, instance, locals);

        return utils.isObject(returnedValue) ? returnedValue : instance;
      }

      return {
        invoke: invoke,
        instantiate: instantiate,
        get: getService,
        annotate: annotate,
        has: function(name) {
          return providerCache.hasOwnProperty(name + providerSuffix) || cache.hasOwnProperty(name);
        }
      };
    }

    var INSTANTIATING = {},
      providerSuffix = 'Provider',
      path = [],
      loadedModules = new hash.HashMap(),
      providerCache = {
        $provide: {
          provider: supportObject(provider),
          factory: supportObject(factory),
          service: supportObject(service),
          value: supportObject(value),
          constant: supportObject(constant),
          decorator: decorator
        }
      },
      providerInjector = (providerCache.$injector =
        createInternalInjector(providerCache, function () {
          throw new Error("Unknown provider: " + path.join(' <- '));
        })),
      instanceCache = {},
      instanceInjector = (instanceCache.$injector =
        createInternalInjector(instanceCache, function (servicename) {
          var provider = providerInjector.get(servicename + providerSuffix);
          return instanceInjector.invoke(provider.$get, provider);
        }));


    utils.forEach(loadModules(modulesToLoad), function (fn) {
      instanceInjector.invoke(fn || function () {
      });
    });


    return instanceInjector;

  };
})(typeof exports === 'undefined'? require('./injector'): exports);



(function(exports){
  'use strict';
  exports.module = require('./module').setupModuleLoader(exports);
  exports.injector = require('./injector').createInjector;

})(typeof exports === 'undefined'? (require('./ng-di')): exports);







})(this);
