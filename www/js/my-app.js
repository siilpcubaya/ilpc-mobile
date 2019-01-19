var $$ = Dom7;

var base_path = 'http://ilpc-mobile.ifubaya.com/'; // root path
var app_path = base_path + 'application/'; // php folder path
var asset_path = app_path + 'assets/'; // asset folder path

var timer1; var timer2; var timer3; var timer4;
var globalTimer1; var globalTimer2; var globalTimer3; var globalTimer4;

var localTimers = [timer1, timer2, timer3, timer4];
var globalTimers = [globalTimer1, globalTimer2, globalTimer3, globalTimer4];

var refreshScoreboard;

var app = new Framework7({
	name: 'ILPC Mobile', // app name
	id: 'com.ilpc.mobile', // package name
	root: '#app',
	theme: 'md',
	cache: false,
	panel: { swipe: 'left' },
	pushState: true,
	routes: [
	  {
	  	path: '/index/',
	  	url: 'index.html'
	  },
	  {
	  	path: '/login/',
	  	url: 'pages/login.html',
	  	on: {
	  	  pageInit: function(e, page) {

			sessionStorage.setItem('t-tick1', 'false');
			sessionStorage.setItem('t-tick2', 'false');
			sessionStorage.setItem('t-tick3', 'false');
			sessionStorage.setItem('t-tick4', 'false');

	  		app.panel.disableSwipe();

	  		$$('#btnLogin').on('click', function() {

	  			var username = $$('#username').val();
	  			var password = $$('#password').val();

	  			app.request.post(app_path + 'auth.php',
	  			{
	  				action: 'login',
	  				username: username,
	  				password: password
	  			},
	  			function(data) {
	  				var obj = JSON.parse(data);
					app.dialog.progress();

					var ret = obj.split(';');

					setTimeout(function() {
						app.dialog.close();

						if(ret[0] == 'SUC') {
							localStorage.setItem('idAdmin', ret[1]);
							localStorage.setItem('title', ret[2]);
							localStorage.setItem('idPost', ret[3]);

							if(localStorage.getItem('title') == 'admin')
								page.router.navigate('/post/', { reloadAll: true });
							else
								page.router.navigate('/home/', { reloadAll: true });
						}
						else {
							app.dialog.alert("Invalid username or password!");
						}

					}, 500);

	  			});
	  		});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(localStorage.idAdmin) {
	  	  		if(localStorage.getItem('title') == 'admin')
	  	  			page.router.navigate('/post/', { reloadAll: true });
	  	  		else
	  	  			page.router.navigate('/home/', { reloadAll: true });
	  	  	}

	  	  }
	  	}
	  },

	  ///////////////////
	  // GUARD ROUTING //
	  ///////////////////

	  {
	  	path: '/home/',
	  	url: 'pages/home.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	var idAdmin = localStorage.getItem('idAdmin');
	  	  	var idPost = localStorage.getItem('idPost');

	  		app.request.post(app_path + 'home.php',
				{
					action: 'getGuard',
					idAdmin: idAdmin
				},
				function(data){
					var obj = JSON.parse(data);

					$$('#postType').append(obj['postType'].toUpperCase());
					$$('#postId').append("POST " + obj['idPost']);
					$$('#postName').append(obj['name']);
				});

	  		app.request.post(app_path + 'home.php',
				{
					action: 'getTeamsNotDone',
					idPost: idPost
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7TeamsNotDone').html())(obj);
					$$('#listTeamsNotDone').html(html);
				});

  			app.request.post(app_path + 'home.php',
				{
					action: 'getTeamsDone',
					idPost: idPost
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7TeamsDone').html())(obj);
					$$('#listTeamsDone').html(html);
				});

  			//Pull to Refresh
	  		$$('.ptr-content').on('ptr:refresh', function(e) {
	  			setTimeout(function() {
	  				var idPost = localStorage.getItem('idPost');

	  				app.request.post(app_path + 'home.php',
					{
						action: 'getTeamsNotDone',
						idPost: idPost
					},
					function(data){
						$$('#listTeamsNotDone').html(
							'<script type="text/template7" id="t7TeamsNotDone">' +
            				  '<li class="item-divider text-align-center">Not done yet</li>' +
            				  '{{#each notdone}}' +
              					'<li>' +
                				  '<a href="/score/{{idTeam}}/" class="item-link item-content">' +
                  					'<div class="item-inner">' +
                    				  '<div class="item-title search-item">{{name}}</div>' +
                  					'</div>' +
            					  '</a>' +
               					'</li>' +
            				  '{{/each}}' +
          					'</script>');

						var obj = JSON.parse(data);
						var html = Template7.compile($$('#t7TeamsNotDone').html())(obj);
						$$('#listTeamsNotDone').html(html);
					});

		  			app.request.post(app_path + 'home.php',
					{
						action: 'getTeamsDone',
						idPost: idPost
					},
					function(data){
						$$('#listTeamsDone').html(
							'<script type="text/template7" id="t7TeamsDone">' +
            				  '<li class="item-divider text-align-center">Done playing</li>' +
            				  '{{#each done}}' +
              					'<li>' +
                				  '<a href="/score/{{idTeam}}/" class="item-link item-content">' +
                  					'<div class="item-inner">' +
                    				  '<div class="item-title search-item">{{name}}</div>' +
                  					'</div>' +
            					  '</a>' +
               					'</li>' +
            				  '{{/each}}' +
          					'</script>');

						var obj = JSON.parse(data);
						var html = Template7.compile($$('#t7TeamsDone').html())(obj);
						$$('#listTeamsDone').html(html);
					});

					e.detail();
	  			}, 1000);
	  		});


	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');

							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}
	  	  }
	  	}
	  },
	  {
	  	path: '/score/:id',
	  	url: 'pages/score.html',
	  	on: {
	  	  pageInit: function(e, page) {
  	  		var idTeam = page.router.currentRoute.params.id;
	  	  	var idPost = localStorage.getItem('idPost');

	  		app.request.post(app_path + 'score.php',
			{
				action: 'getTeam',
				idTeam: idTeam
			},
			function(data){
				var team = JSON.parse(data);
				$$('#teamName').append(
	              '<div class="item-inner">' +
	                '<div class="item-title item-label">Team</div>' +
	                '<div class="item-input">' +
	                  '<input type="hidden" name="team-id" disabled="true" value="' + team['id'] + '">' +
	                  '<input type="text" name="team-name" disabled="true" value="' + team['name'] + '">' +
	                '</div>' +
	              '</div>'
				);
			});

	  		app.request.post(app_path + 'score.php',
			{
				action: 'listScore',
				idPost: idPost
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Score').html())(obj);
				$$('#teamScore').html(html);
			});

	  		$$('#btnsubmit').on('click', function(){
	  			var point = $$('#teamScore').val();

	  			app.request.post(app_path + 'score.php',
				{
					action: 'inputScore',
					idTeam: idTeam,
					idPost: idPost,
					point: point
				},
				function(data){
					var obj = JSON.parse(data);

					if(obj == 'success'){
						app.dialog.alert("Leaderboard Updated!");
						page.router.navigate('/home/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Update Leaderboard");
					}
				});
	  		});
	  	  }
	  	}
	  },
	  {
	  	path: '/scoreboard/',
	  	url: 'pages/scoreboard.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	var idPost = localStorage.getItem('idPost');

	  	  	app.request.post(app_path + 'scoreboard.php',
	  	  	{
	  	  		action: 'getScore',
	  	  		idPost: idPost
	  	  	},
	  	  	function(data){
	  	  		var obj = JSON.parse(data);

	  	  		var html = Template7.compile($$('#t7Scoreboard').html())(obj);
				$$('#listScoreboard').html(html);
	  	  	});

	  	  	refreshScoreboard = setInterval(function(){
				app.request.post(app_path + 'scoreboard.php',
		  	  	{
		  	  		action: 'getScore',
		  	  		idPost: idPost
		  	  	},
		  	  	function(data){
		  	  		$$('#listScoreboard').html(
		  	  			'<script type="text/template7" id="t7Scoreboard">' +
              				'{{#each teams}}' +
                				'<tr>' +
                  				  '<td class="label-cell">{{rank}}</td>' +
				                  '<td class="label-cell">{{name}}</td>' +
                				  '<td class="numeric-cell">{{score}}</td>' +
                				'</tr>' +
              				'{{/each}}' +
            			'</script>');

		  	  		var obj = JSON.parse(data);
		  	  		var html = Template7.compile($$('#t7Scoreboard').html())(obj);
					$$('#listScoreboard').html(html);
		  	  	});
			}, 5000);

	  	  },
	  	  pageBeforeOut: function(e, page) {
	  	  	clearInterval(refreshScoreboard);
	  	  }
	  	}
	  },
	  {
	  	path: '/timer/:tab',
	  	url: 'pages/timer.html',
	  	on: {
	  	  pageInit: function(e, page) {
			var tab = page.router.currentRoute.params.tab;
			app.tab.show('#tab-' + tab, false);

	  	  	// clearInterval(globalTimer);
			globalTimers.forEach(function(gTimer) { clearInterval(gTimer); });

			$$('.shortcut1').on('click', function() {
				shortcutClick(this, 1);
			});
			$$('.shortcut2').on('click', function() {
				shortcutClick(this, 2);
			});
			$$('.shortcut3').on('click', function() {
				shortcutClick(this, 3);
			});
			$$('.shortcut4').on('click', function() {
				shortcutClick(this, 4);
			});

			function shortcutClick(c, num) {
				var gauge = app.gauge.get('.timer-gauge' + num);

	  	  		if($$(c).data('value') != '60') {
	  	  			var value = $$(c).data('value');

	  	  			var stepHour = app.stepper.get('#stepHour' + num);
	  	  			var stepMin = app.stepper.get('#stepMin' + num);
	  	  			var stepSec = app.stepper.get('#stepSec' + num);

	  	  			stepHour.setValue(0);
	  	  			stepMin.setValue(parseInt(value));
	  	  			stepSec.setValue(0);

	  	  			if(parseInt(value) < 10) value = "0" + value;

	  	  			gauge.update({
					  valueText: "00" + ':' + value + ':' + "00",
					});
	  	  		}
	  	  		else {
	  	  			stepHour.setValue(1);
	  	  			stepMin.setValue(0);
	  	  			stepSec.setValue(0);

	  	  			gauge.update({
					  valueText: "01" + ':' + "00" + ':' + "00",
					});
	  	  		}
			}

	  	  	$$('#input-hour1').on('change', function() {
	  	  		hourChange(1);
	  	  	});
			$$('#input-hour2').on('change', function() {
	  	  		hourChange(2);
	  	  	});
			$$('#input-hour3').on('change', function() {
	  	  		hourChange(3);
	  	  	});
			$$('#input-hour4').on('change', function() {
	  	  		hourChange(4);
	  	  	});

			function hourChange(num) {
				var gauge = app.gauge.get('.timer-gauge' + num);

	  	  		var valtext = gauge.params.valueText.split(':');
	  	  		var hour = $$('#input-hour' + num).val();
	  	  		var min = valtext[1];
	  	  		var sec = valtext[2];

	  	  		if(hour < 10) hour = '0' + hour.toString();
	  	  		else hour = hour.toString();

				gauge.update({
				  value: 1,
				  valueText: hour + ':' + min + ':' + sec,
				});
			}

			$$('#input-minute1').on('change', function() {
				minuteChange(1);
	  	  	});
			$$('#input-minute2').on('change', function() {
				minuteChange(2);
	  	  	});
			$$('#input-minute3').on('change', function() {
				minuteChange(3);
	  	  	});
			$$('#input-minute4').on('change', function() {
				minuteChange(4);
	  	  	});

			function minuteChange(num) {
				var gauge = app.gauge.get('.timer-gauge' + num);

	  	  		var valtext = gauge.params.valueText.split(':');
	  	  		var hour = valtext[0];
	  	  		var min = $$('#input-minute' + num).val();
	  	  		var sec = valtext[2];

	  	  		if(min < 10) min = '0' + min.toString();
	  	  		else min = min.toString();

				gauge.update({
				  value: 1,
				  valueText: hour + ':' + min + ':' + sec,
				});
			}

	  	  	$$('#input-second1').on('change', function() {
				secondChange(1);
	  	  	});
			$$('#input-second2').on('change', function() {
				secondChange(2);
	  	  	});
			$$('#input-second3').on('change', function() {
				secondChange(3);
	  	  	});
			$$('#input-second4').on('change', function() {
				secondChange(4);
	  	  	});

			function secondChange(num) {
				var gauge = app.gauge.get('.timer-gauge' + num);

	  	  		var valtext = gauge.params.valueText.split(':');
	  	  		var hour = valtext[0];
	  	  		var min = valtext[1];
	  	  		var sec = $$('#input-second' + num).val();

	  	  		if(sec < 10) sec = '0' + sec.toString();
	  	  		else sec = sec.toString();

				gauge.update({
				  value: 1,
				  valueText: hour + ':' + min + ':' + sec,
				});
			}

			initGauge();

			function initGauge() {
				for(i = 1; i <= 4; i++) {
					// START TIMER GAUGE INITIALIZE //
			  	  	var value = 1;
			  	  	var valueText = "00:00:00";

			  	  	if(sessionStorage.getItem('t-tick' + i) == 'true') {
			  	  		var totalTime = sessionStorage.getItem('t-time' + i);
			  	  		value = totalTime * sessionStorage.getItem('t-sub' + i);

			  	  		hour = parseInt(totalTime / 3600);
		  	  			min = parseInt(totalTime % 3600 / 60);
		  	  			sec = parseInt(totalTime % 3600 % 60);

		  	  			if(hour < 10) hour = "0" + hour.toString();
		  	  			if(min < 10) min = "0" + min.toString();
		  	  			if(sec < 10) sec = "0" + sec.toString();

		  	  			valueText = hour + ':' + min + ':' + sec;
			  	  	}

					var element = '.timer-gauge' + i;
			  	  	var timerGauge = app.gauge.create({
					  el: '.timer-gauge' + i,
					  type: 'circle',
					  borderColor: '#000',
					  value: value,
					  valueText: valueText,
					  valueTextColor: '#000',
					});

					if(sessionStorage.getItem('t-tick' + i) == 'true') {
						$$('#start' + i).trigger('click');
					}
					// END TIMER GAUGE INITIALIZE //
				}
			}

	  	  	$$('#start1').on('click', function() {
				startTimer(this, 1);
	  	  	});
			$$('#start2').on('click', function() {
				startTimer(this, 2);
	  	  	});
			$$('#start3').on('click', function() {
				startTimer(this, 3);
	  	  	});
			$$('#start4').on('click', function() {
				startTimer(this, 4);
	  	  	});

			function startTimer(c, num) {
				var gauge = app.gauge.get('.timer-gauge' + num);
	  	  		var valtext = gauge.params.valueText.split(':');
	  	  		var hour = valtext[0];
	  	  		var min = valtext[1];
	  	  		var sec = valtext[2]

	  	  		var totalTime = parseInt(valtext[0]) * 3600 + parseInt(valtext[1]) * 60 + parseInt(valtext[2]) * 1;
  	  			var substrahend = 1.0 / totalTime;

  	  			if(sessionStorage.getItem('t-sub' + num) > 0) {
  	  				totalTime = sessionStorage.getItem('t-time' + num);
  	  				substrahend = sessionStorage.getItem('t-sub' + num);
  	  			}

	  	  		if($$(c).text() == "Start") {
	  	  			if(totalTime > 0){

			  	  		$$(c).text('Pause');
			  	  		$$('.col-content' + num).css('visibility', 'hidden');

			  	  		sessionStorage.setItem('t-tick' + num, 'true');
			  	  		sessionStorage.setItem('t-sub' + num, substrahend);
		  	  			sessionStorage.setItem('t-time' + num, totalTime);

		  	  			localTimers[num-1] = setInterval(function() {
		  	  				// console.log("timer");
		  	  				var gaugeValue = totalTime * substrahend;

			  	  			totalTime--;
			  	  			sessionStorage.setItem('t-time' + num, totalTime);

			  	  			hour = parseInt(totalTime / 3600);
			  	  			min = parseInt(totalTime % 3600 / 60);
			  	  			sec = parseInt(totalTime % 3600 % 60);

			  	  			if(hour < 10) hour = "0" + hour.toString();
			  	  			if(min < 10) min = "0" + min.toString();
			  	  			if(sec < 10) sec = "0" + sec.toString();

			  	  			gauge.update({
			  	  			  value: gaugeValue - substrahend,
							  valueText: hour + ':' + min + ':' + sec,
							});

			  	  			if(totalTime <= 0) {
			  	  				var hour = $$('#input-hour' + num).val();
			  	  				var min = $$('#input-minute' + num).val();
	  	  						var sec = $$('#input-second' + num).val();

	  	  						if(hour < 10) hour = "0" + hour.toString();
				  	  			if(min < 10) min = "0" + min.toString();
				  	  			if(sec < 10) sec = "0" + sec.toString();

			  	  				gauge.update({
				  	  			  value: 1,
								  valueText: hour + ':' + min + ':' + sec,
								});

								sessionStorage.setItem('t-tick' + num, 'false');
								// sessionStorage.setItem('t-time' + num, 0);
								sessionStorage.setItem('t-sub' + num, 0);

			  	  				$$('#start' + num).text('Start');
			  	  				$$('.col-content' + num).css('visibility', 'visible');

				  				clearInterval(globalTimers[num-1]);
			  	  				clearInterval(localTimers[num-1]);
				  				openNotif(num);
			  	  			}

			  	  		}, 1000);
	  	  			}
	  	  		}
	  	  		else if($$(c).text() == 'Pause') {
	  	  			var gauge = app.gauge.get('.timer-gauge' + num);

		  	  		var totalTime = sessionStorage.getItem('t-time' + num);
		  	  		var value = totalTime * sessionStorage.getItem('t-sub' + num);

		  	  		hour = parseInt(totalTime / 3600);
	  	  			min = parseInt(totalTime % 3600 / 60);
	  	  			sec = parseInt(totalTime % 3600 % 60);

	  	  			$$('#input-hour' + num).val(hour);
	  	  			$$('#input-minute' + num).val(min);
	  	  			$$('#input-second' + num).val(sec);

	  	  			$$(c).text('Start');
	  	  			$$('.col-content' + num).css('visibility', 'visible');

	  	  			sessionStorage.setItem('t-tick' + num, 'false');

					clearInterval(globalTimers[num-1]);
					clearInterval(localTimers[num-1]);
	  	  		}
			}

	  	  	$$('#restart1').on('click', function() {
	  	  		restartTimer(this, 1);
	  	  	});
			$$('#restart2').on('click', function() {
	  	  		restartTimer(this, 2);
	  	  	});
			$$('#restart3').on('click', function() {
	  	  		restartTimer(this, 3);
	  	  	});
			$$('#restart4').on('click', function() {
	  	  		restartTimer(this, 4);
	  	  	});

			function restartTimer(c, num) {
				var gauge = app.gauge.get('.timer-gauge' + num);

	  	  		gauge.update({
  	  			  value: 1,
				  valueText: "00:00:00"
				});

				sessionStorage.setItem('t-tick' + num, 'false');
				// sessionStorage.setItem('t-time', 0);
				sessionStorage.setItem('t-sub' + num, 0);

				$$('.input' + num).val("0");

				app.stepper.get('#stepHour' + num).setValue(0);
				app.stepper.get('#stepMin' + num).setValue(0);
				app.stepper.get('#stepSec' + num).setValue(0);

				$$('#start' + num).text('Start');
				$$('.col-content' + num).css('visibility', 'visible');

				clearInterval(globalTimers[num-1]);
				clearInterval(localTimers[num-1]);
			}

	  	  },
	  	  pageAfterIn: function(e, page) {
			for(i = 1; i <= 4; i++) {
				if(sessionStorage.getItem('t-tick' + i) == 'true') {
		  	  		$$('#start' + i).trigger('click');
		  	  		$$('#start' + i).text('Pause');
		  	  		$$('.col-content' + i).css('visibility', 'hidden');
		  	  	}
		  	  	else {
		  	  		$$('#start' + i).text('Start');
		  	  		$$('.col-content' + i).css('visibility', 'visible');
		  	  	}
			}
	  	  },
	  	  pageBeforeOut: function(e, page) {
	  	  	localTimers.forEach(function(lTimer) { clearInterval(lTimer); });

			startGlobalTimer(1);
			startGlobalTimer(2);
			startGlobalTimer(3);
			startGlobalTimer(4);

			function startGlobalTimer(num) {
				var substrahend = sessionStorage.getItem('t-sub' + num);

				if(sessionStorage.getItem('t-tick' + num) == 'true') {

					globalTimers[num - 1] = setInterval(function() {
						// console.log("globalTimer");
						var totalTime = sessionStorage.getItem('t-time' + num);
						var gaugeValue = totalTime * substrahend;

						totalTime--;
						sessionStorage.setItem('t-time' + num, totalTime);

						hour = parseInt(totalTime / 3600);
						min = parseInt(totalTime % 3600 / 60);
						sec = parseInt(totalTime % 3600 % 60);

						if(hour < 10) hour = "0" + hour.toString();
						if(min < 10) min = "0" + min.toString();
						if(sec < 10) sec = "0" + sec.toString();

						app.gauge.update({
						  value: gaugeValue - substrahend,
						  valueText: hour + ':' + min + ':' + sec,
						});

						if(totalTime <= 0) {
							var hour = $$('#input-hour' + num).val();
							var min = $$('#input-minute' + num).val();
							var sec = $$('#input-second' + num).val();

							if(hour < 10) hour = "0" + hour.toString();
							if(min < 10) min = "0" + min.toString();
							if(sec < 10) sec = "0" + sec.toString();

							app.gauge.update({
							  value: 1,
							  valueText: hour + ':' + min + ':' + sec,
							});

							sessionStorage.setItem('t-tick' + num, 'false');
							// sessionStorage.setItem('t-time', 0);
							sessionStorage.setItem('t-sub' + num, 0);

							$$('#start' + num).text('Start');
							$$('.col-content' + num).css('visibility', 'visible');

							clearInterval(localTimers[num-1]);
							clearInterval(globalTimers[num-1]);
							openNotif(num);
						}
					}, 1000);
				}
			}

	  	  }
	  	}
	  },

	  ///////////////////
	  // ADMIN ROUTING //
	  ///////////////////

	  {
	  	path: '/post/',
	  	url: 'pages/admin/post.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	// localStorage.removeItem('idAdmin');
	  	  	// localStorage.removeItem('title');
	  	  	// localStorage.removeItem('idPost');

	  	  	app.panel.enableSwipe();

	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');

							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

			app.request.post(app_path + 'post.php',
			{
				action: 'getPost'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Posts').html())(obj);
				$$('#listPosts').html(html);
			});

			////////////////
			// Game Modal //
			////////////////
			app.request.post(app_path + 'game.php',
			{
				action: 'getGameType',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GameType').html())(obj);
				$$('#selectGameType').append(html);
			});

			app.request.post(app_path + 'game.php',
			{
				action: 'getPostType',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostType').html())(obj);
				$$('#selectPostType').append(html);
			});

			$$('#btnAddGame').on('click', function() {
				var gameName = $$('#gameName').val();
				var gameType = $$('select[name="gameType"]').val();
				var postType = $$('select[name="postType"]').val();

				app.request.post(app_path + 'game.php',
				{
					action: 'insertGame',
					gameName: gameName,
					gameType: gameType,
					postType: postType
				},
				function(data) {
					var obj = JSON.parse(data);

					if(obj == 'SUC')
						app.dialog.alert("Game Added!");
					else
						app.dialog.alert("Fail to Add Game");
				});
			});

			////////////////
			// Post Modal //
			////////////////
			app.request.post(app_path + 'game.php',
			{
				action: 'getFreeGame',
				idPost: '-1'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostGame').html())(obj);
				$$('#selectPostGame').append(html);
			});

			$$('#btnAddPost').on('click', function() {
				var postId = $$('input[name="postId"]').val();
				var postGame = $$('select[name="postGame"]').val();

				if(postId == "") postId = -1;

				app.request.post(app_path + 'post.php',
				{
					action: 'insertPost',
					postId: postId,
					postGame: postGame
				},
				function(data) {
					var obj = data;

					if(obj == 'SUC')
						app.dialog.alert("Post Added!");
					else
						app.dialog.alert("Fail to Add Post!");
				});
			});

			/////////////////
			// Guard Modal //
			/////////////////
			app.request.post(app_path + 'guard.php',
			{
				action: 'getAvailableGuard'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GuardUsername').html())(obj);
				$$('#selectGuardUsername').append(html);
			});

			app.request.post(app_path + 'game.php',
			{
				action: 'getGuardGame'
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7GuardGame').html())(obj);
				$$('#selectGuardGame').append(html);
			});

			$$('#btnSetGuard').on('click', function(){
				var admin = $$('select[name="guardUsername"]').val();
				var game = $$('select[name="gameId"]').val();

				app.request.post(app_path + 'guard.php',
				{
					action: 'setGuard',
					idAdmin: admin,
					idGame: game
				},
				function(data) {
					var obj = JSON.parse(data);

					if(obj == 'success')
						app.dialog.alert("Guard Has Set!");
					else
						app.dialog.alert("Fail to Set Guard");
				});
			});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}

	  	  }
	  	}
	  },
	  {
	  	path: '/post/:id/',
	  	url: 'pages/admin/post-input.html',
	  	on: {
	  	  pageInit: function(e, page) {

	  	  	app.panel.enableSwipe();

	  	  	var idPost = page.router.currentRoute.params.id;
			$$('#postName').val(idPost);

			app.request.post(app_path + 'game.php',
			{
				action: 'getGame',
				idPost: idPost
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7Game').html())(obj);
				$$('#selectGame').html(html);
			});

			$$('#btnUpdateGame').on('click', function(){
				var chosenGame = $$('#selectGame').val();

				app.request.post(app_path + 'post.php',
				{
					action: 'updateGamePost',
					idPost: idPost,
					idGame: chosenGame
				},
				function(data){
					var obj = JSON.parse(data);

					if(obj == 'success'){
						app.dialog.alert("Game has updated!");
						page.router.navigate('/posts/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Update Game");
					}
				});
			});

	  	  }
	  	}
	  },
	  {
	  	path: '/post-adv/',
	  	url: 'pages/admin/post-adv.html',
		smartSelect: {
			formColorTheme: 'black',
			navbarColorTheme: 'black'
		},
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	app.panel.enableSwipe();

	  	  	if(localStorage.idAdmin){
				$$('.btnLogout').on('click', function() {
					app.dialog.confirm("Are you sure?", "Logout", function() {
						app.dialog.progress();
						setTimeout(function() {
							app.dialog.close();

							localStorage.removeItem('idAdmin');
							localStorage.removeItem('title');
							localStorage.removeItem('idPost');

							page.router.navigate('/login/', { animate: false, reloadAll: true });
						}, 500);
					});
				});
			}

			app.request.post(app_path + 'post.php',
			{
				action: 'getPostAdv',
			},
			function(data){
				var obj = JSON.parse(data);
				var html = Template7.compile($$('#t7PostsAdv').html())(obj);
				$$('#listPostsAdv').html(html);
			});

	  	  },
	  	  pageAfterIn: function(e, page) {

	  	  	if(!localStorage.idAdmin) {
	  	  		page.router.navigate('/login/', { reloadAll: true });
	  	  	}
	  	  	else {
	  	  		if(localStorage.title == 'gamemaster') {
	  	  			$$('.panel-gamemaster').show();
	  	  			$$('.panel-admin').hide();
	  	  		}
	  	  		else if(localStorage.title == 'admin') {
	  	  			$$('.panel-gamemaster').hide();
	  	  			$$('.panel-admin').show();
	  	  		}
	  	  	}

	  	  }
	  	}
	  },
	  {
	  	path: '/team/',
	  	url: 'pages/admin/team.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	var length;

			app.request.post(app_path + 'team.php',
				{
					action: 'showTeams'
				},
				function(data){
					var obj = JSON.parse(data);
					length = obj['teams'].length;
					var html = Template7.compile($$('#t7Team').html())(obj);
					$$('#listTeams').html(html);
				});

			$$(document).on('change', '.toggle', function(){
				$$(this).toggleClass('checked');
			});

			$$('#btnSaveTeam').on('click', function()
			{
				var teamlist = [];

				app.dialog.confirm("Save Teams?", "Team",
					function(e){

						for(var i = 1; i <= length; i++){
							if($$('input[value="' + i + '"]').parent().hasClass('checked')){
								var teamId = $$('input[value="' + i + '"]').data('id');
								var teamname = $$('input[value="' + i + '"]').data('name');
								teamlist.push(teamId + ";" + teamname);
							}
						}
						app.request.post(app_path + 'team.php',
						{
							action: 'insertTeams',
							teams: teamlist
						},
						function(data){
							page.router.navigate('/post/');
						});

					});
			});
		   }
		 }
	  },
	  {
	  	path: '/game/',
	  	url: 'pages/admin/game.html',
	  	on: {
	  	  pageInit: function(e, page) {
	  	  	app.panel.enableSwipe();

			app.request.post(app_path + 'game.php',
				{
					action: 'getGameType'
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7Game').html())(obj);
					$$('#games').html(html);
				});

			app.request.post(app_path + 'game.php',
				{
					action: 'getPostType'
				},
				function(data){
					var obj = JSON.parse(data);
					var html = Template7.compile($$('#t7Post').html())(obj);
					$$('#posts').html(html);
				});

			$$('#btnsubmit').on('click', function(){
				var name = $$('#name').val();
				var game = $$('#games').val();
				var post = $$('#posts').val();

				app.request.post(app_path + 'game.php',
				{
					action: 'insertGamePost',
					name: name,
					idGame: game,
					idPost: post
				},
				function(data){
					var obj = JSON.parse(data);

					if(obj == 'success'){
						app.dialog.alert("GamePost has added!");
						page.router.navigate('/posts/', { reloadAll: true });
					}
					else {
						app.dialog.alert("Fail to Add GamePost");
					}
				});
			});
	  	  }
	  	}
	  }
	]
});

var mainView = app.views.create('.view-main', { url: '/login/' });

function openNotif(num) {
	var notif = app.notification.create({
	  title: 'Timer',
	  titleRightText: 'now',
	  subtitle: "Timer " + num + " Stopped",
	  text: "Your timer " + num + " has stopped. Check it now.",
	  closeOnClick: true,
	  closeTimeout: 2000
	  // on: {
	  //   close: function () {
	  //     app.views.main.router.navigate('/timer/' + num);
	  //   },
	  // },
	});

	notif.open();
}
