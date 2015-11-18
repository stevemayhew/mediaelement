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
			// Make sure missedRecordingDuration is a number. Other fields can be undefined.
			t.missedRecordingDuration = player.options.missedRecordingDuration || 0;
			t.recordedDuration = player.options.recordedDuration;
			t.totalRecordingDuration = player.options.totalRecordingDuration;
			// Keep track of when playback starts, in case we need to calculate the recorded duration.
			// This assumes that if we're recording, recording will continue in real-time while we play,
			// even if the user pauses.
			t.playbackStartTime = new Date().getTime();
			//console.info('missed:' + t.missedRecordingDuration + ', recorded: ' + t.recordedDuration + ', total:' + t.totalRecordingDuration);
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

			var railTime = t.getTotalRecordingDuration();
			var pixelsPerSec = t.rail.width() / railTime;
			var beforeTime = t.missedRecordingDuration;
			var sliderTime = t.getCurrentRecordedTime();
			var bufferedTime = sliderTime - t.media.currentTime;
			var afterTime = railTime - beforeTime - sliderTime;
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

		getTotalRecordingDuration: function() {
			var t = this;
			var totalRecordingDuration = t.media.duration;

			// Start with t.media.duration as the final fallback. In the case
			// of a complete recording, it will be the correct value.
			// If totalRecordingDuration was passed in, it will take precedence.
			// We do this in case we are playing back an in-progress recording,
			// where t.media.duration is constantly increasing. For playback
			// of an in-progress recording on Safari, where no totalRecordingDuration
			// has been specified, this will be Infinity, so as the final fallback, we
			// try to figure out how much as been buffered so far. Not necessarily accurate.

			if (t.totalRecordingDuration) {
				totalRecordingDuration = t.totalRecordingDuration;
			} else if (t.media.duration === Infinity) {
				totalRecordingDuration = t.getCurrentRecordedTime();
			}

			return totalRecordingDuration;
		},

		getCurrentRecordedTime: function() {
			var t = this;
			// Start with a worst-case scenario return value, where we know nothing about buffering.
			var recordedEndTime = 0;

			//console.info('gcrt.duration:' + t.media.duration);

			if (t.recordedDuration !== undefined) {
				// First, find the number of seconds since playback began.
				recordedEndTime = (new Date().getTime() - t.playbackStartTime) / 1000;
				// Then, add in any pre-recorded portion, making sure we don't go past the total.
				// We need to use totalRecordingDuration here, and not t.media.duration, since we
				// cannot depend on it for a recording in-progress. Assuming that if t.recordingDuration
				// is defined, t.totalRecordingDuration is also defined.
				recordedEndTime = Math.min(recordedEndTime + t.recordedDuration, t.totalRecordingDuration);
			} else if (t.media.duration && t.media.duration !== Infinity) {
				// We have a duration, but it will be Infinity for an in-progress recording on Safari.
				recordedEndTime = t.media.duration;
			} else {
				//recordedEndTime = 0;
			}

			//console.info('getCurrentRecordedTime() => ' + recordedEndTime + ' ' + (recordedEndTime - t.media.currentTime));
			return recordedEndTime;
		}
	});
})(mejs.$);
