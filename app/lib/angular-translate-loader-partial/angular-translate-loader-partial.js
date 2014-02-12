angular.module('pascalprecht.translate').provider('$translatePartialLoader', [function () {
    function Part(name) {
      this.name = name;
      this.isActive = true;
      this.tables = {};
    }
    Part.prototype.parseUrl = function (urlTemplate, targetLang) {
      return urlTemplate.replace(/\{part\}/g, this.name).replace(/\{lang\}/g, targetLang);
    };
    Part.prototype.getTable = function (lang, $q, $http, urlTemplate, errorHandler) {
      var deferred = $q.defer();
      if (!this.tables.hasOwnProperty(lang)) {
        var self = this;
        $http({
          method: 'GET',
          url: this.parseUrl(urlTemplate, lang)
        }).success(function (data) {
          self.tables[lang] = data;
          deferred.resolve(data);
        }).error(function () {
          if (errorHandler !== undefined) {
            errorHandler(self.name, lang).then(function (data) {
              self.tables[lang] = data;
              deferred.resolve(data);
            }, function () {
              deferred.reject(self.name);
            });
          } else
            deferred.reject(self.name);
        });
      } else
        deferred.resolve(this.tables[lang]);
      return deferred.promise;
    };
    var parts = {};
    var wtiProject;

    function hasPart(name) {
      return parts.hasOwnProperty(name);
    }
    function isStringValid(str) {
      return angular.isString(str) && str !== '';
    }
    function isPartAvailable(name) {
      if (!isStringValid(name)) {
        throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
      }
      return hasPart(name) && parts[name].isActive;
    }
    function deepExtend(dst, src) {
      for (var property in src) {
        if (src[property] && src[property].constructor && src[property].constructor === Object) {
          dst[property] = dst[property] || {};
          arguments.callee(dst[property], src[property]);
        } else {
          dst[property] = src[property];
        }
      }
      return dst;
    }
    this.addPart = function (name) {
      if (!isStringValid(name)) {
        throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
      }
      if (!hasPart(name)) {
        parts[name] = new Part(name);
      }
      parts[name].isActive = true;
      return this;
    };
    this.setPart = function (lang, part, table) {
      if (!isStringValid(lang)) {
        throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
      }
      if (!isStringValid(part)) {
        throw new TypeError('Invalid type of a second argument, a non-empty string expected.');
      }
      if (typeof table !== 'object' || table === null) {
        throw new TypeError('Invalid type of a third argument, an object expected.');
      }
      if (!hasPart(part)) {
        parts[part] = new Part(part);
        parts[part].isActive = false;
      }
      parts[part].tables[lang] = table;
      return this;
    };
    this.deletePart = function (name) {
      if (!isStringValid(name)) {
        throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
      }
      if (hasPart(name)) {
        parts[name].isActive = false;
      }
      return this;
    };
    this.isPartAvailable = isPartAvailable;
    this.$get = [
      '$rootScope',
      '$injector',
      '$q',
      '$http',
      function ($rootScope, $injector, $q, $http) {
        var service = function (options) {
          if (!isStringValid(options.key)) {
            throw new TypeError('Unable to load data, a key is not a non-empty string.');
          }
          if (!isStringValid(options.urlTemplate)) {
            throw new TypeError('Unable to load data, a urlTemplate is not a non-empty string.');
          }
          if (!isStringValid(options.wtiProjectId)) {
            throw new TypeError('Unable to access wti, wtiProjectIt is not a non-empty string');
          }
          if (!isStringValid(options.wtiPublicApiToken)) {
            throw new TypeError('Unable to access wti, wtiPublicApiToken is not a non-empty string');
          }
          var errorHandler = options.loadFailureHandler;
          if (errorHandler !== undefined) {
            if (!angular.isString(errorHandler)) {
              throw new Error('Unable to load data, a loadFailureHandler is not a string.');
            } else
              errorHandler = $injector.get(errorHandler);
          }

          var loaders = [], tables = [], deferred = $q.defer();
          function addTablePart(table) {
            tables.push(table);
          }

          if (!wtiProject) {
              var wtiDeferred = $q.defer();
              $http({method: 'GET',
                  url: '/api/projects/'+options.wtiPublicApiToken + '.json',
              headers: {'X-Client-Name': 'yp-angular-translate-wti-loader',
                        'X-Client-Version': '0.0.1'
              }})
                  .success(function(data) {
                      wtiDeferred.resolve(data);
                  })
                  .error(function(err) {
                      wtiDeferred.reject(err);
                  });
              wtiProject = wtiDeferred.promise;
          }


          return wtiProject.then(function(wtiProjectData) {
              for (var part in parts) {
                  if (hasPart(part) && parts[part].isActive) {
                      var myPart = parts[part];
                      var mySourceUrl = myPart.parseUrl(options.urlTemplate, options.key).slice(1);
                      var myFileObj = _.find(wtiProjectData.project.project_files, function(file) {
                          return file.name === mySourceUrl;
                      });
                      var myWtiUrl;
                      if (myFileObj) {
                           myWtiUrl = "/api/projects/"+options.wtiPublicApiToken + "/files/"+myFileObj.id +"/locales/"+options.key;
                      }

                      loaders.push(parts[part].getTable(options.key, $q, $http, myWtiUrl || options.urlTemplate, errorHandler).then(addTablePart));
                  }
              }
              if (loaders.length) {
                  $q.all(loaders).then(function () {
                      var table = {};
                      for (var i = 0; i < tables.length; i++) {
                          deepExtend(table, tables[i]);
                      }
                      deferred.resolve(table);
                  }, function () {
                      deferred.reject(options.key);
                  });
              } else {
                  deferred.resolve({});
              }
              return deferred.promise;
          });

        };
        service.addPart = function (name) {
          if (!isStringValid(name)) {
            throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
          }
          if (!hasPart(name)) {
            parts[name] = new Part(name);
            $rootScope.$broadcast('$translatePartialLoaderStructureChanged', name);
          } else if (!parts[name].isActive) {
            parts[name].isActive = true;
            $rootScope.$broadcast('$translatePartialLoaderStructureChanged', name);
          }
          return service;
        };
        service.deletePart = function (name, removeData) {
          if (!isStringValid(name)) {
            throw new TypeError('Invalid type of a first argument, a non-empty string expected.');
          }
          if (removeData === undefined) {
            removeData = false;
          } else if (typeof removeData !== 'boolean') {
            throw new TypeError('Invalid type of a second argument, a boolean expected.');
          }
          if (hasPart(name)) {
            var wasActive = parts[name].isActive;
            if (removeData) {
              delete parts[name];
            } else {
              parts[name].isActive = false;
            }
            if (wasActive) {
              $rootScope.$broadcast('$translatePartialLoaderStructureChanged', name);
            }
          }
          return service;
        };
        service.isPartAvailable = isPartAvailable;
        return service;
      }
    ];
  }]);