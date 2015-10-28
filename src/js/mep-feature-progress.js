(function($) {

	$.extend(mejs.MepDefaults, {
		progessHelpText: mejs.i18n.t(
		'Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.')
	});

	// progress/loaded bar
	$.extend(MediaElementPlayer.prototype, {
		buildprogress: function(player, controls, layers, media) {

			// #liveprogress added two divs for dead area
            $(
               '<div class="mejs-time-rail">' +
                '<span class="mejs-time-skipped-recording"></span>' +
                '<span class="mejs-time-total mejs-time-slider">' +
                //'<span class="mejs-offscreen">' + this.options.progessHelpText + '</span>' +
                    '<span class="mejs-time-buffering"></span>' +
                    '<span class="mejs-time-loaded"></span>' +
                    '<span class="mejs-time-current"></span>' +
                    '<span class="mejs-time-handle"></span>' +
                    '<span class="mejs-time-float">' +
                        '<span class="mejs-time-float-current">00:00</span>' +
                        '<span class="mejs-time-float-corner"></span>' +
                    '</span>' +
                '</span>' +
                '<span class="mejs-time-future-recording"></span>' +
                '</div>')
                .appendTo(controls);
			controls.find('.mejs-time-buffering').hide();

			var
				t = this,
                rail = controls.find('.mejs-time-rail'),
				total = controls.find('.mejs-time-total'),
				loaded  = controls.find('.mejs-time-loaded'),
				current  = controls.find('.mejs-time-current'),
				handle  = controls.find('.mejs-time-handle'),
				timefloat  = controls.find('.mejs-time-float'),
				timefloatcurrent  = controls.find('.mejs-time-float-current'),
                slider = controls.find('.mejs-time-slider'),
                blockedBegin = controls.find('.mejs-time-skipped-recording'),
                blockedEnd = controls.find('.mejs-time-future-recording'),
				handleMouseMove = function (e) {

                    var offset = total.offset(),
						width = total.outerWidth(true),
						percentage = 0,
						newTime = 0,
						pos = 0,
                        x;

                    // mouse or touch position relative to the object
					if (e.originalEvent.changedTouches) {
						x = e.originalEvent.changedTouches[0].pageX;
					}else{
						x = e.pageX;
					}

					if (t.getCurrentRecordedTime()) {
						if (x < offset.left) {
							x = offset.left;
						} else if (x > width + offset.left) {
							x = width + offset.left;
						}

						pos = x - offset.left;
						percentage = (pos / width);
						newTime = (percentage <= 0.02) ? 0 : percentage * t.getCurrentRecordedTime();

						// seek to where the mouse is
						if (mouseIsDown && newTime !== media.currentTime) {
							media.setCurrentTime(newTime);
						}

						// position floating time box
						if (!mejs.MediaFeatures.hasTouch) {
								timefloat.css('left', pos);
								timefloatcurrent.html( mejs.Utility.secondsToTimeCode(newTime) );
								timefloat.show();
						}
					}
				},
				mouseIsDown = false,
				mouseIsOver = false,
				lastKeyPressTime = 0,
				startedPaused = false,
				autoRewindInitial = player.options.autoRewind;
			// #live missed recording time and total recording duration needed for the
			// live (dynamic) scrub bar.
			t.missedRecordingDuration = player.options.missedRecordingDuration;
			t.totalRecordingDuration = player.options.totalRecordingDuration;
			// Accessibility for slider
			var updateSlider = function (e) {

				var seconds = media.currentTime,
					timeSliderText = mejs.i18n.t('Time Slider'),
					time = mejs.Utility.secondsToTimeCode(seconds),
					duration = t.getCurrentRecordedTime();

				slider.attr({
					'aria-label': timeSliderText,
					'aria-valuemin': 0,
					'aria-valuemax': duration,
					'aria-valuenow': seconds,
					'aria-valuetext': time,
					'role': 'slider',
					'tabindex': 0
				});

			};

            var restartPlayer = function () {
				var now = new Date();
				if (now - lastKeyPressTime >= 1000) {
					media.play();
				}
			};

			slider.bind('focus', function (e) {
				player.options.autoRewind = false;
			});

			slider.bind('blur', function (e) {
				player.options.autoRewind = autoRewindInitial;
			});

			slider.bind('keydown', function (e) {

				if ((new Date() - lastKeyPressTime) >= 1000) {
					startedPaused = media.paused;
				}

				var keyCode = e.keyCode,
					duration = t.getCurrentRecordedTime(),
					seekTime = media.currentTime;

				switch (keyCode) {
				case 37: // left
					seekTime -= 1;
					break;
				case 39: // Right
					seekTime += 1;
					break;
				case 38: // Up
					seekTime += Math.floor(duration * 0.1);
					break;
				case 40: // Down
					seekTime -= Math.floor(duration * 0.1);
					break;
				case 36: // Home
					seekTime = 0;
					break;
				case 35: // end
					seekTime = duration;
					break;
				case 10: // enter
					media.paused ? media.play() : media.pause();
					return;
				case 13: // space
					media.paused ? media.play() : media.pause();
					return;
				default:
					return;
				}

				seekTime = seekTime < 0 ? 0 : (seekTime >= duration ? duration : Math.floor(seekTime));
				lastKeyPressTime = new Date();
				if (!startedPaused) {
					media.pause();
				}

				if (seekTime < t.getCurrentRecordedTime() && !startedPaused) {
					setTimeout(restartPlayer, 1100);
				}

				media.setCurrentTime(seekTime);

				e.preventDefault();
				e.stopPropagation();
				return false;
			});


			// handle clicks
			//controls.find('.mejs-time-rail').delegate('span', 'click', handleMouseMove);
			total
				.bind('mousedown touchstart', function (e) {
					// only handle left clicks or touch
					if (e.which === 1 || e.which === 0) {
						mouseIsDown = true;
						handleMouseMove(e);
						t.globalBind('mousemove.dur touchmove.dur', function(e) {
							handleMouseMove(e);
						});
						t.globalBind('mouseup.dur touchend.dur', function (e) {
							mouseIsDown = false;
							timefloat.hide();
							t.globalUnbind('.dur');
						});
					}
				})
				.bind('mouseenter', function(e) {
					mouseIsOver = true;
					t.globalBind('mousemove.dur', function(e) {
						handleMouseMove(e);
					});
					if (!mejs.MediaFeatures.hasTouch) {
						timefloat.show();
					}
				})
				.bind('mouseleave',function(e) {
					mouseIsOver = false;
					if (!mouseIsDown) {
						t.globalUnbind('.dur');
						timefloat.hide();
					}
				});

			// loading
			media.addEventListener('progress', function (e) {
				player.setProgressRail(e);
				player.setCurrentRail(e);
			}, false);

			// current time
			media.addEventListener('timeupdate', function(e) {
				player.setProgressRail(e);
				player.setCurrentRail(e);
				updateSlider(e);
			}, false);


			// store for later use
            t.rail = rail;
			t.loaded = loaded;
			t.total = total;
			t.current = current;
			t.handle = handle;
            t.blockedBegin = blockedBegin;
            t.blockedEnd = blockedEnd;
		},
		setProgressRail: function(e) {

			var t = this;

			var pixelsPerSec = t.rail.width() / t.totalRecordingDuration;
			var railTime = t.totalRecordingDuration;
			var beforeTime = t.missedRecordingDuration;
			var sliderTime = t.getCurrentRecordedTime();
			var bufferedTime = sliderTime - t.media.currentTime;
			var afterTime = t.totalRecordingDuration - beforeTime - sliderTime;
			//console.info('r:' + railTime + ', b:' + beforeTime + ', s:' + sliderTime + ', B:' + bufferedTime + ', a:' + afterTime);
			var railWidth = railTime * pixelsPerSec;
			var beforeWidth = beforeTime * pixelsPerSec;
			var sliderWidth = sliderTime * pixelsPerSec;
			var bufferedWidth = bufferedTime * pixelsPerSec;
			var afterWidth = afterTime * pixelsPerSec;
			//console.info('rw:' + railWidth + ', bw:' + beforeWidth + ', sw:' + sliderWidth + ', Bw:' + bufferedWidth + ', aw:' + afterWidth);
			t.total.width(sliderWidth);
			t.loaded.width(sliderWidth - bufferedWidth);
			t.total.css("left", beforeWidth);
			t.blockedBegin.width(beforeWidth);
			t.blockedEnd.width(afterWidth);
		},
		setCurrentRail: function() {

			var t = this;

			if (t.media.currentTime !== undefined && t.getCurrentRecordedTime()) {

				// update bar and handle
				if (t.total && t.handle) {
					var
						newWidth = Math.round(t.total.width() * t.media.currentTime / t.getCurrentRecordedTime()),
						handlePos = newWidth - Math.round(t.handle.outerWidth(true) / 2);

					t.current.width(newWidth);
					t.handle.css('left', handlePos);
				}
			}

		},

		getCurrentRecordedTime: function() {
			var t = this;
			// Start with a worst-case scenario return value, where we know nothing about buffering.
			var bufferedEndTime = t.media.currentTime;
			var bufferLength = t.media.buffered.length;

			//console.info('gcrt.duration:' + t.media.duration);

			if (t.media.duration && t.media.duration !== Infinity) {
				// We have a duration. Will be Infinity for an in-progress recording on Safari.
				bufferedEndTime = t.media.duration;
			} else if (t.media.buffered && t.media.buffered.end && t.media.buffered.length) {
				// Find the buffer containing the current playback time and return its endTime.
				for (var j=0; j < t.media.buffered.length; j++) {
					var startTime = t.media.buffered.start(j);
					var endTime = t.media.buffered.end(j);
					//console.info('s:' + startTime + ', c:' + bufferedEndTime + ', e:' + endTime);
					// bufferedEndTime is a copy of t.media.currentTime. Shorter reference chain, this way.
					if (startTime <= bufferedEndTime && bufferedEndTime <= endTime) {
						bufferedEndTime = endTime;
						bufferLength += '.'+j;
						break;
					}
				}
				// If we cannot find the right buffer, return current time, as a last ditch effort.
			}

			//console.info(bufferLength + ' : ' + 'getCurrentRecordedTime() => ' + bufferedEndTime + ' ' + (bufferedEndTime - t.media.currentTime));
			return bufferedEndTime;
		}
	});
})(mejs.$);