'use strict';

/* Services */

var googleCalServices = angular.module('calendarApp');

//Google authentication services
googleCalServices.factory('GoogleAuthService', ['$window', '$q', function($window, $q){
	var GoogleAuthService = {};
	var clientId = '134766462956-j8i9t6tq1lpk6vpmqk6s7b04l2r9e7m0.apps.googleusercontent.com'
    //var apiKey = '{API KEY}';
  var scopes = 'https://www.googleapis.com/auth/calendar';

  function handleAuthResult(authResult) {
      //Handle auth result. If not authenticated, redirect to home screen
        if (authResult && !authResult.error) {
            return true;
        } else {
            window.location.href = "/#/home";
            return false;
        }
    }

  //Generic function to authorize
  function genericAuthorization(func, immdte){
  	return gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: immdte}, func);
  }

  //Checks auth without prompting an auth window
  GoogleAuthService.checkAuth = function(){
    	var deferred = $q.defer();
    	var result = genericAuthorization(handleAuthResult, true);
    	deferred.resolve(result);
        return deferred.promise;
  }

  //Check auth with an auth window
  GoogleAuthService.authRequest = function(){
    var deferred = $q.defer();
    var result = genericAuthorization(handleAuthResult, false);
    deferred.resolve(result);
    return deferred.promise;
  }

  //Adds an event to the user's google calendar
  GoogleAuthService.addEvent = function(el){
    	//set up the promise
      var deferred = $q.defer();
      //load the calendar
      gapi.client.load('calendar', 'v3', function() {
    		var date = el.date;
    		var summary = el.summary
    		var timeMin = new Date(date);
      		var timeMax = new Date(date);
      		timeMin.setHours(0,0,0,0);
      		timeMax.setHours(24,0,0,0);
    		var resource = {
  				"summary": summary,
				"location": "Somewhere",
				"start": {
					"dateTime": timeMin
				},
				"end": {
				    "dateTime": timeMax
  				    }
  			};
  			var request = gapi.client.calendar.events.insert({
  			  'calendarId': 'primary',
  			  'resource': resource
  			});
  			request.execute(function(resp) {
  			  if(!resp.error) {
            console.log(resp);
            deferred.resolve(true);
          }
          else {
            deferred.resolve(false);
          }
  			});
    	});
      return deferred.promise;
    }

    //Large method to get all the events the user has under their primary calendar
    GoogleAuthService.getAllEvents = function(date) {
        var deferred = $q.defer(),

        // gets the primary calendar that the user has on Google Calendar
        getCalendars = function() {
          var calDeferred = $q.defer();

          gapi.client.load('calendar', 'v3', function() {
              var request = gapi.client.calendar.calendarList.list({});
              request.execute(function(resp) {
                  if(!resp.error) {
                    var calendarIds = [];
                    //can get all calendars a user has, but we don't want that, 
                    //so this will do for now
                    for(var i = 0; i < 1; i++) {
                      calendarIds.push(resp.items[i].id);
                    }
                    calDeferred.resolve(calendarIds);
                  }
                  else {
                    calDeferred.reject(resp.error);
                  }
              });
          });

          return calDeferred.promise;
        },
        // get all events for a calendar
        getEvents = function() {
          	var events = [];
          	var eventsDeferred = $q.defer();
          	var timeMin = new Date(date);
      		var timeMax = new Date(date);
      		timeMin.setHours(0,0,0,0);
      		timeMax.setHours(24,0,0,0);

          var request = gapi.client.calendar.events.list({
           'calendarId': 'primary',
          'timeMin': timeMin.toISOString(),
          'timeMax': timeMax.toISOString(),
          'showDeleted': false,
          'singleEvents': true,
          'maxResults': 10,
          'orderBy': 'startTime'
          });

          request.execute(function(resp) {
              if(!resp.error) {
                for(var j = 0; j < resp.items.length; j++) {
                  events.push(resp.items[j]);
                }
                eventsDeferred.resolve(events);
              }
              else {
                eventsDeferred.reject(resp.error);
              }
          });

          return eventsDeferred.promise;
        },
        getAllEvents = function() {
          getCalendars().then(function (calendarIds) {
            var eventCalls = [];

            // get promise for each calendar event query
            for(var i = 0; i < calendarIds.length; i++) {
              eventCalls.push(getEvents(calendarIds[i]));
            }

            // make all calls to get all events
            $q.all(eventCalls).then(function(results) {
              var aggregatedData = [];

              angular.forEach(results, function (result) {
                  aggregatedData = aggregatedData.concat(result);
              });

              deferred.resolve(aggregatedData);
            });
          },
          function (errorMessage) {
            deferred.reject(errorMessage);
          });
        };

        // login to google API before making calls
        genericAuthorization(getAllEvents, true);

        return deferred.promise;
      }

    return GoogleAuthService;


}]);