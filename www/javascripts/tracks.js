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
		.module('tracks', ['ngSanitize', 'model'])

		.controller('PlayerTrackListCtrl', ['Tracks', 'Players', '$rootScope', function(Tracks, Players, $rootScope) {
			var vm = this;

			vm.loadTrackList = function () {
				Tracks.getTrackList(function (data) {
					vm.trackList = data;
				}, function (err) {
					console.log(err);
				});
			};

			vm.loadTrackStatusList = function () {
				// TODO fix API to use session in backend and remove session param and $rootScope...
				Players.getTracksStatus($rootScope.session._id, function (data) {
					vm.trackStatusList = data;
				}, function (err) {
					console.log(err);
				});
			};

			vm.loadTrackList();
			vm.loadTrackStatusList();

		}])

		.controller('PlayerTrackCtrl', ['Tracks', 'Players', '$stateParams', '$rootScope', function(Tracks, Players, $stateParams, $rootScope) {
		console.log("test");
			var vm = this;
			vm.trackId = $stateParams.tid;

			vm.loadTrack = function() {
				Tracks.getTrack(vm.trackId,
					function(data) {
						vm.track = data;
					}, function(err) {});
			};

			vm.loadTrackMissions = function() {
				Tracks.getTrackMissions(vm.trackId,
					function(data) {
						vm.missions = data;
					}, function(err) {});
			};

			vm.loadTrackStatus = function () {
				// TODO fix API to use session in backend and remove session param and $rootScope...
				Players.getTrackStatus($rootScope.session._id, vm.trackId, function (data) {
					vm.trackStatus = data;
				}, function (err) {
					console.log(err);
				});
			};

			vm.loadTrack();
			vm.loadTrackMissions();
			vm.loadTrackStatus();
		}])

		.directive('playerTracks', [function() {
			return {
				controller: 'PlayerTrackListCtrl',
				controllerAs: 'vm',
				restrict: 'EA',
				templateUrl: '/directives/tracks/player_track_list.html',
			};
		}])

		.directive('playerTrack', [function() {
			return {
				controller: 'PlayerTrackCtrl',
				controllerAs: 'vm',
				restrict: 'E',
				templateUrl: '/directives/tracks/player_track.html'
			};
		}])

		.directive('trackMissionsTree', [function() {
			return {
				replace: true,
				restrict: 'E',
				scope: {
					missions: '='
				},
				templateUrl: '/directives/track-tree.html',
				link: function ($scope, element, attrs) {
					$scope.buildMap = function(missions) {
						var map = {};
						missions.forEach(function(mission) {
							map[mission._id] = mission;
						});
						return map;
					}
					$scope.drawTree = function(missions) {
						var svg = d3.select(element[0])
						var inner = svg.select("g")
						var render = new dagreD3.render();

						// Left-to-right layout
						var g = new dagreD3.graphlib.Graph()
							.setGraph({
								nodesep: 20,
								ranksep: 50,
								rankdir: "LR",
								marginx: 10,
								marginy: 10
							})
						  .setDefaultEdgeLabel(function() { return {}; });

						function draw(isUpdate) {
							var map = $scope.buildMap(missions);
							missions.forEach(function(mission, index) {
								g.setNode(mission._id, {
									labelType: "html",
									label: "<p class='number'>" + (index + 1) + "</p>",
									rx: 5,
									ry: 5,
									padding: 0,
									id: mission._id,
									class: "locked"
								});
								mission.parents.__items.forEach(function(parent) {
									g.setEdge(parent, mission._id, {
										class: "locked"
									});
								});
							});

							render(inner, g);

							$("svg .node").tipsy({
								gravity: $.fn.tipsy.autoNS,
								fade: true,
								html: true,
								title: function() {
									var mission = map[this.id];
									var html = ''
									html += "<div class='mission-tip locked'>" +
												"<h3>" + mission.title + "</h3>" +
												"<p>" + mission.reward + " pts</p>"
									for(var i in mission.stars.__items) {
										var star = mission.stars.__items[i];
										html += "<span class='glyphicon glyphicon-star-empty' title='" + star.title + "' />";
									}
									html += "</div>"
									return html;
								}
							});
							$("svg .node").click(function() {
								var status = map[this.id];
								window.location.href = "/missions/" + this.id;
							});

							// Zoom and scale to fit
							var graphWidth = g.graph().width;
							var graphHeight = g.graph().height;
							var width = parseInt(svg.style("width").replace(/px/, ""));
							var height = parseInt(svg.style("height").replace(/px/, ""));
							var zoomScale = Math.min(width / graphWidth, height / graphHeight);
							var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];

							var zoom = d3.behavior.zoom().on("zoom", function() {
								inner.attr("transform", "translate(" + d3.event.translate + ")" +
									"scale(" + d3.event.scale + ")");
							});
							zoom.translate(translate);
							zoom.scale(zoomScale);
							zoom.event(isUpdate ? svg.transition().duration(500) : d3.select("svg"));
						}
						draw();
					}

					$scope.$watch('missions', function(missions) {
						if(!missions) { return; }
						$scope.drawTree(missions);
					})
				}
			};
		}])

		.directive('trackTree', [function() {
			return {
				replace: true,
				restrict: 'E',
				scope: {
					missionsStatus: '='
				},
				templateUrl: '/directives/track-tree.html',
				link: function ($scope, element, attrs) {
					$scope.buildMap = function(missionsStatus) {
						var map = {};
						missionsStatus.forEach(function(status) {
							map[status.mission._id] = status;
						});
						return map;
					}
					$scope.drawTree = function(missionsStatus) {
						var svg = d3.select(element[0])
						var inner = svg.select("g")
						var render = new dagreD3.render();

						// Left-to-right layout
						var g = new dagreD3.graphlib.Graph()
							.setGraph({
								nodesep: 20,
								ranksep: 50,
								rankdir: "LR",
								marginx: 10,
								marginy: 10
							})
						  .setDefaultEdgeLabel(function() { return {}; });

						function draw(isUpdate) {
							var map = $scope.buildMap(missionsStatus);
							missionsStatus.forEach(function(status, index) {
								g.setNode(status.mission._id, {
									labelType: "html",
									label: "<p class='number'>" + (index + 1) + "</p>",
									rx: 5,
									ry: 5,
									padding: 0,
									id: status.mission._id,
									class: status.status
								});
								status.mission.parents.__items.forEach(function(parent) {
									g.setEdge(parent, status.mission._id, {
										class: map[parent].status
									});
								});
							});

							var hasStar = function(star, stars) {
								for(var i = 0; i < stars.__items.length; i++) {
									var s = stars.__items[i]
									if(s._id == star._id) return true;
								}
								return false;
							}

							render(inner, g);

							$("svg .node").tipsy({
								gravity: $.fn.tipsy.autoNS,
								fade: true,
								html: true,
								title: function() {
									var status = map[this.id];
									var html = ''
									html += "<div class='mission-tip " + status.status + "'>" +
												"<h3>" + status.mission.title + "</h3>" +
												"<p>" + status.mission.reward + " pts</p>"
									for(var i in status.mission.stars.__items) {
										var star = status.mission.stars.__items[i];
										if(hasStar(star, status.stars)) {
											html += "<span class='glyphicon glyphicon-star' />";
										} else {
											html += "<span class='glyphicon glyphicon-star-empty' />";
										}
									}
									html += "</div>"
									return html;
								}
							});
							$("svg .node").click(function() {
								var status = map[this.id];
								window.location.href = "/missions/" + this.id;
							});

							// Zoom and scale to fit
							var graphWidth = g.graph().width;
							var graphHeight = g.graph().height;
							var width = parseInt(svg.style("width").replace(/px/, ""));
							var height = parseInt(svg.style("height").replace(/px/, ""));
							var zoomScale = Math.min(width / graphWidth, height / graphHeight);
							var translate = [(width/2) - ((graphWidth*zoomScale)/2), (height/2) - ((graphHeight*zoomScale)/2)];

							var zoom = d3.behavior.zoom().on("zoom", function() {
								inner.attr("transform", "translate(" + d3.event.translate + ")" +
									"scale(" + d3.event.scale + ")");
							});
							zoom.translate(translate);
							zoom.scale(zoomScale);
							zoom.event(isUpdate ? svg.transition().duration(500) : d3.select("svg"));
						}
						draw();
					}

					$scope.$watch('missionsStatus', function(missionsStatus) {
						if(!missionsStatus) { return; }
						$scope.drawTree(missionsStatus);
					})
				}
			};
		}])
})();
