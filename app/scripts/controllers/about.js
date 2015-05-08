'use strict';

/**
 * @ngdoc function
 * @name calendarApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the calendarApp
 */
angular.module('calendarApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
