'use strict';

/* Controllers */

var myCalendarControllers = angular.module('calendarApp');

//Controller for retrieving and adding events
myCalendarControllers.controller('EventController', ['$scope', '$http', 'GoogleAuthService',
    function ($scope, $http, GoogleAuthService) {

    $scope.getEvents = function() {
      //First do an auth to see if the user is actually authenticated
      //if not, redirect to login screen.
      var selectedDate = new Date($scope.dateEntered);
      console.log($scope.dateEntered);
      var selectedStart = new Date($scope.start);
      var selectedEnd = new Date($scope.end);
      var todayStart = new Date(selectedDate).setHours(selectedStart.getHours(), selectedStart.getMinutes(),0,0 );
      var todayEnd = new Date(selectedDate).setHours(selectedEnd.getHours(), selectedEnd.getMinutes(),0,0);
      $scope.start =
         new Date(todayStart);
      $scope.end =
        new Date(todayEnd);
      var authRequest = GoogleAuthService.checkAuth().then(function(authResponse) {
        if(authResponse){
          //if authorized, then get events
          var events = GoogleAuthService.getAllEvents($scope.dateEntered, $scope.start, $scope.end).then(function(result){
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

    //Forces the user to first look at today's events upon authenticating with Google
    $scope.init = function() {
      $scope.dateEntered = new Date();
      var selectedDate = new Date($scope.dateEntered);
      console.log($scope.dateEntered);
      var todayStart = new Date(selectedDate).setHours(6,0,0,0);
      var todayEnd = new Date(selectedDate).setHours(18,0,0,0);
      $scope.start =
         new Date(todayStart);
      $scope.end =
        new Date(todayEnd);
      $scope.getEvents();

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
