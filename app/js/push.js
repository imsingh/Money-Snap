angular.module('service.push', [])
.factory('$cordovaPushwoosh', ['$q', '$window', '$http', function ($q, $window, $http) {
    var GOOGLE_PROJECT_ID = "197499054373";
    var PUSHWOOSH_APPID = "C17C4-F6654";
    var pushwoosh_endpoint = "https://cp.pushwoosh.com/json/1.3";
    var auth_key = "UuqGVLm1hm0dbbHf1abW4VP54fXSdN39rwO5an6ZI7MrkFSoK2q0Bq6UiToTWAKKBJ20v9ZeekQGdsfwdis5";

    return {
      initPushwoosh: function () {
        var q = $q.defer();
        console.log("Pushwoosh Init started");
    		var pushNotification = $window.plugins.pushNotification;

    		if(device.platform == "Android") {
            	//initialize Pushwoosh with projectid: "GOOGLE_PROJECT_NO", appid : "PUSHWOOSH_APP_ID". This will trigger all pending push notifications on start.
    			pushNotification.onDeviceReady({ projectid: GOOGLE_PROJECT_ID, appid : PUSHWOOSH_APPID });
          console.log('it is android');
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
        console.log($window.plugins.pushNotification);
        $window.plugins.pushNotification.unregisterDevice(function (result) {
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
      },

      sendPush: function(data) {

        var url = pushwoosh_endpoint + '/createMessage';
        var request = {
            "request": {
                "application": PUSHWOOSH_APPID,
                "auth": auth_key,
                "notifications": [{
                    "send_date": "now",
                    "ignore_user_timezone": true,
                    "content": data.content,
                    "devices": [data.targetUser]
                }]
            }
        };

        return $http.post(url, JSON.stringify(request));
      }
    };
  }]);