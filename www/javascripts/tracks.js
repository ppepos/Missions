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

		.controller('TrackHome', ['$routeParams', '$scope', function($routeParams, $scope) {
			$scope.trackId = $routeParams.tid;
		}])

		.controller('TrackCtrl', ['Tracks', function(Tracks) {
			$trackCtrl = this;

			this.loadTrack = function() {
				Tracks.getTrack(this.trackId,
					function(data) {
						$trackCtrl.track = data;
					}, function(err) {});
			};

			this.loadTrackMissions = function() {
				Tracks.getTrackMissions(this.trackId,
					function(data) {
						$trackCtrl.missions = data;
					}, function(err) {});
			};

			this.loadTrack();
			this.loadTrackMissions();
		}])

		.directive('track', [function() {
			return {
				scope: {},
				bindToController: {
					trackId: '='
				},
				controller: 'TrackCtrl',
				controllerAs: 'trackCtrl',
				restrict: 'E',
				replace: true,
				templateUrl: '/directives/tracks/track.html'
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
})();
