'use strict';

angular.module('missions', ['ngRoute', 'ngResource', 'utils'])

	.factory('Missions', ['$resource', function ($resource) {
		return $resource("/api/missions/");
	}])

	.factory('Mission', ['$resource', function Mission($resource) {
		return $resource("/api/missions/:mid");
	}])

	.factory('Mission', ['$resource', function Mission($resource) {
		return $resource("/api/missions/:mid");
	}])

	.controller('MissionsCtrl', ['$scope', '$routeParams', '$resource', 'Mission', function MissionsCtrl($scope, $routeParams, $resource, Mission) {
		// Controller logic here
		$scope.missionId = $routeParams.mid;
		$scope.mission = Mission.get({mid: $scope.missionId});
	}])

	.directive('pepsPlayerMission', function () {
		return {
			templateUrl: 'directives/player/peps_mission.html'
		}
	})
;
