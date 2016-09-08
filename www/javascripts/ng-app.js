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
	angular.module('ng-app', ['ngSanitize', 'ui.router', 'ncy-angular-breadcrumb', 'angular-loading-bar', 'tracks', 'missions', 'players', 'notifications', 'friends', 'achievements'])

	.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
		cfpLoadingBarProvider.includeSpinner = false;
	}])

	.config(function($breadcrumbProvider) {
		$breadcrumbProvider.setOptions({
			prefixStateName: 'home'
		})
	})

	.config(function($stateProvider, $locationProvider) {
		$stateProvider
			.state({
				name: 'home',
				url: '/',
				templateUrl: '/views/index.html',
				controller: 'PlayersCtrl',
				ncyBreadcrumb: {
					label: 'Home'
				}
			})
			.state('login', {
				url: '/login',
				controller : function(){
					window.location.replace('/auth/login');
				},
			    template : "<div></div>"
			})
			.state('shiblogin', {
				url: '/auth/shiblogin',
				controller : function(){
					window.location.replace('/auth/shiblogin');
				},
			    template : "<div></div>"
			})
			.state('logout', {
				url: '/logout',
				controller : [ '$rootScope', function($rootScope){
					$rootScope.player = null;
					window.location.replace('/auth/logout');
				}],
			    template : "<div></div>"
			})
			.state('play', {
				abstract: true,
				templateUrl: 'views/play_base.html',
				controller: 'PlayerAuth',
				controllerAs: 'vm',
				ncyBreadcrumb: {
					label: 'Play'
				}
			})
			.state('play.tracks', {
				url: '/tracks',
				templateUrl: 'views/track_list.html',
				controller: 'PlayerTrackListCtrl',
				controllerAs: 'vm',
				ncyBreadcrumb: {
					label: 'Track List'
				}
			})
			.state('play.tracks.track', {
				url: '/{tid}',
				views: {
					'@play': {
						templateUrl: 'views/track.html',
						controller: 'PlayerTrackCtrl',
						controllerAs: 'vm'
					}
				},
				ncyBreadcrumb: {
					label: 'Track'
				}
			})
			.state('play.tracks.track.mission', {
				url: '/:mid',
				views: {
					'@play': {
						templateUrl: 'views/mission.html',
						controller : 'MissionCtrl',
						controllerAs: 'vm'
					}
				},
				ncyBreadcrumb: {
					label: 'Mission'
				}
			})
			.state("otherwise", {
				url: "*path",
				templateUrl: "views/404.html"
			});

		$locationProvider.html5Mode(true);

	});
})();
