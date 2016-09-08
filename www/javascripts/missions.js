/*
 * Copyright 2016 Alexandre Terrasa <alexandre@moz-code.org>.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
	angular
		.module('missions', ['ngSanitize', 'model'])

		.controller('MissionCtrl', ['Missions', '$stateParams', function(Missions, $stateParams) {
			var vm = this;
			vm.missionId = $stateParams.mid;

			vm.loadMission = function() {
				Missions.getMission(vm.missionId,
					function(data) {
						vm.mission = data;
					}, function(err) {});
			};

			vm.loadMission();

		}])

		.controller('PlayerMissionCtrl', ['Errors', 'Players', '$stateParams', '$scope', '$rootScope', function (Errors, Players, $stateParams, $scope, $rootScope) {

			var vm = this;
			vm.playerId = $rootScope.session._id;
			vm.missionId = $stateParams.mid;

			vm.getMissionStatus = function () {
				Players.getMissionStatus(vm.playerId, vm.missionId, function(data) {
					vm.missionStatus = data;
				}, Errors.handleError);
			};

			vm.statusByStar = function (starId) {
				var unlocked = false;
				angular.forEach(vm.missionStatus.star_status.__items, function (starStatus) {
					if(starId == starStatus.star._id) {
						unlocked = starStatus.is_unlocked;
					}
				});
				return unlocked;
			};

			$scope.$on('mission_submission', function (data) {
				vm.getMissionStatus();
			});

			vm.getMissionStatus();

		}])

		.controller('MissionSubmitCtrl', ['Missions', '$scope', function (Missions, $scope) {
			$scope.source = "";
			$scope.lang = "pep8";
			$scope.engine = "pep8term";

			$scope.submit = function () {
				var data = {
					source: $scope.source,
					lang: $scope.lang,
					engine: $scope.engine
				};
				Missions.sendMissionSubmission(data, $scope.missionId, function (data) {
					$scope.source = data;
					$scope.$emit('mission_submission', 'success');
				}, function () {
					console.log("err");
				});
			};
		}])

		.directive('mission', [function() {
			return {
				bindToController: {
					missionId: '='
				},
				controller: 'MissionCtrl',
				controllerAs: 'vm',
				restrict: 'E',
				templateUrl: '/directives/missions/mission.html'
			};
		}])

		.directive('playerMission', [function() {
			return {
				bindToController: {
					missionId: '='
				},
				controller: 'PlayerMissionCtrl',
				controllerAs: 'vm',
				restrict: 'E',
				templateUrl: '/directives/missions/player_mission.html'
			};
		}])

		.directive('missionSubmit', [function () {
			return {
				transclude: true,
				scope: {
					missionId: '='
				},
				restrict: 'E',
				templateUrl: '/directives/missions/submit.html'
			};
		}])
})();
