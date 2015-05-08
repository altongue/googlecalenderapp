'use strict';

/* Controllers */

var myCalendarControllers = angular.module('calendarApp');

//Controller for retrieving and adding events
myCalendarControllers.controller('EventController', ['$scope', '$http', 'GoogleAuthService',
    function ($scope, $http, GoogleAuthService) {
    $scope.getEvents = function() {
      //First do an auth to see if the user is actually authenticated
      //if not, redirect to login screen. 
      var authRequest = GoogleAuthService.checkAuth().then(function(authResponse) {
        if(authResponse){
          //if authorized, then get events
          var events = GoogleAuthService.getAllEvents($scope.dateEntered).then(function(result){
            $scope.events = result;
            if(result.length > 0){
              console.log("Successful retrieval of events.")
              document.getElementById('error').innerHTML = "";
            } else {
              document.getElementById('error').innerHTML = "No events retrieved.";
              console.log("No events retrieved.")
            }
          });
        }
      });
    };

    //add event. No need for a check because of other checks. 
    $scope.addEvent = function () {
      if(typeof($scope.dateEntered) != "undefined"){
        var newEvent = {"summary": $scope.event, "date": $scope.dateEntered};
        var results = GoogleAuthService.addEvent(newEvent).then(function(){
          $scope.getEvents();
          $scope.event = '';
        });
      } else {
        $scope.error = "Please enter a date."
      }
    };

  }]);

//simple controller in charge of handling the login screen
myCalendarControllers.controller('MainController', ['$scope', '$location', 'GoogleAuthService', 
 function ($scope, $location, GoogleAuthService) {

  $scope.handleAuthClick=function (event) {
        var auth = GoogleAuthService.authRequest().then(function(result){
          if(auth){
            $location.path('/calendar');
          } 
      });
  }


}]);

