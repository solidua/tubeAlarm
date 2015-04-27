var app = angular.module('alarmModule', []); 

//run
app.run(function () {
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});


//factory
app.factory('mainFactory', ['$window',  function($window) {
	var factory = {}; 
	var results = [];
	var youTube = null; 

	factory.getResults = function(){
		return results
	};

	factory.processData = function(data){
		results = []
		for (var i = data.items.length - 1; i >= 0; i--){
       		results.push({
           		title: data.items[i].snippet.title,
           		id: data.items[i].id.videoId,
           		author: data.items[i].snippet.channelTitle,
           		thumbnail: data.items[i].snippet.thumbnails.default.url
       		});
       	}	
      	return results;  
	}

	factory.newVideo = function(id) {
		youTube.loadVideoById(id);
		youTube.pauseVideo(); 

	} 
	$window.onYouTubeIframeAPIReady = function() {
		console.log("Youtube API is ready"); 
        youTube = new YT.Player('player', {
          height: '390',
          width: '100%',
          videoId: 'lTx3G6h2xyA',
          playerVars: {
          	rel: 0, 
          	showinfo: 0,
          	controls: 0
          }
        });
    }

    factory.pauseYT = function() {
    	youTube.pauseVideo(); 
    }

    factory.playYT = function() {
    	youTube.playVideo();
    }

    return factory; 
}]); 
	

//searchController: manages search
app.controller('searchController', ['$scope', '$http', 'mainFactory', function($scope, $http, mainFactory){
	$scope.results = []
	$scope.snooze

	$scope.search = function(){
		$http.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
				key: 'AIzaSyA5zZxSf2Xg2WEufqmJ3U8kq2p8xKbNsh0',
				type: 'video',
				maxResults: '5',
				part: 'id,snippet',
				fileds: 'items/id, items/snippet/title, items/snippet/thumbnails/default, items/snippet/channelTitle',
				q: this.query, 
			}
		})
		.success(function (data) {
			console.log(data);
			$scope.results = mainFactory.processData(data)
		})
		.error(function (data){
			console.log("search error"); 
		});  
	}; 

	$scope.select = function(id) {
		mainFactory.newVideo(id); 
	}
}]); 

//alarmController: manages alarm and time
app.controller('AlarmController', function($scope, $timeout, $http, mainFactory) {
	$scope.alarmTime = {
		aHr: 0, 
		aMin: 0
	};

	$scope.currentTime = new Date();  
	$scope.snooze = 0; 
	$scope.onOnce = false; 
	
	var tick = function () {


		if($scope.alarmOn) {
			if ($scope.currentTime.getHours() == $scope.alarmTime.aHr &&
				$scope.currentTime.getMinutes() == $scope.alarmTime.aMin &&
				$scope.snooze == 0) {
				$scope.onOnce = true; 
				mainFactory.playYT(); 
			} else if ($scope.snooze != 0) {
				mainFactory.pauseYT(); 
				$scope.snooze--; 
				if($scope.snooze == 0) {
					mainFactory.playYT(); 
				}
			}
		} else if ($scope.onOnce) {
			mainFactory.pauseYT(); 
		}

		$scope.currentTime = new Date(); 
		$timeout(tick, 1000); 
	}

	$timeout(tick, 1000);

	$scope.setSnooze = function () {
		console.log("snooze click"); 
		$scope.snooze = 10; 
	}

	$scope.incHr = function() {
		if($scope.alarmTime.aHr == 23) {
			$scope.alarmTime.aHr = 0; 
		} else {
			$scope.alarmTime.aHr++;  
		} 
	}

	$scope.decHr = function() {
		if($scope.alarmTime.aHr == 0) {
			$scope.alarmTime.aHr = 23; 
		} else {
			$scope.alarmTime.aHr--; 	
		}
	}

	$scope.incMin = function() {
		if($scope.alarmTime.aMin == 59) {
			$scope.alarmTime.aMin = 0; 
		} else {
			$scope.alarmTime.aMin++; 
		}
	}

	$scope.decMin = function() {
		if($scope.alarmTime.aMin == 0) {
			$scope.alarmTime.aMin = 59; 
		} else {
			$scope.alarmTime.aMin--; 
		}
	}
});

//date to string filter
app.filter('dateString', function() {
	return function(input) {
		if (input < 10) {
			return ('0' + input.toString());  
		} else {
			return input; 
		}  
	}
});



