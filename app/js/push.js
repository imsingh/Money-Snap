angular.module('service.push', [])
.factory('$cordovaPushwoosh', ['$q', '$window', function ($q, $window) {
    var GOOGLE_PROJECT_ID = "197499054373";
    var PUSHWOOSH_APPID = "50A94-8B7AF";
    
    return {
      initPushwoosh: function () {
        var q = $q.defer();
        console.log("Pushwoosh Init started");
    		var pushNotification = $window.plugins.pushNotification;

    		if(device.platform == "Android") {
            	//initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NO", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
    			pushNotification.onDeviceReady({ projectid: GOOGLE_PROJECT_ID, appid : PUSHWOOSH_APPID });

    		}else if(device.platform == "iPhone" || device.platform == "iOS") {
    			//initialize the plugin
    			pushNotification.onDeviceReady({pw_appid:PUSHWOOSH_APPID});
    			//reset badges on app start
    			pushNotification.setApplicationIconBadgeNumber(0);
    		}

    		pushNotification.registerDevice(
    			function(status) {
              console.log(status);
    					q.resolve(status);
    			},
    			function(status) {
    					q.reject(status);
    			}
    		);
    		return q.promise;
          },

      unregister: function (options) {
        var q = $q.defer();
        $window.plugins.pushNotification.unregister(function (result) {
          q.resolve(result);
        }, function (error) {
          q.reject(error);
        }, options);

        return q.promise;
      },

      // iOS only
      setBadgeNumber: function (number) {
        var q = $q.defer();
        $window.plugins.pushNotification.setApplicationIconBadgeNumber(function (result) {
          q.resolve(result);
        }, function (error) {
          q.reject(error);
        }, number);
        return q.promise;
      }
    };
  }]);