(function($) {
    // closed caption toggle
    $.extend(MediaElementPlayer.prototype, {
        buildclosedcaption: function(player, controls, layers, media) {
            var
                t = this,
            // find the CC button
                closedCaption = $('.mejs-button.mejs-closed-caption');
            if (closedCaption.length === 0) {
                // if not yet created, create a disabled CC button.
                closedCaption =
                    $('<div class="mejs-button mejs-closed-caption mejs-closed-caption-disabled">' +
                    '<button type="button" aria-controls="' + t.id + '" title="Toggle Closed Caption" aria-label="Toggle Closed Caption"></button>' +
                    '</div>')
                        // append it to the toolbar
                        .appendTo(controls)
                        // add a click toggle event
                        .click(function () {
                            var isDisabled = closedCaption.is('.mejs-closed-caption-disabled');
                            if (!isDisabled) {
                                var mode;
                                var wasOn = closedCaption.is('.mejs-closed-caption-on');
                                var wasOff = closedCaption.is('.mejs-closed-caption-off');
                                if (wasOff && !wasOn) {
                                    closedCaption.removeClass('mejs-closed-caption-off').addClass('mejs-closed-caption-on');
                                    mode = "showing";
                                }
                                if (wasOn && !wasOff) {
                                    closedCaption.removeClass('mejs-closed-caption-on').addClass('mejs-closed-caption-off');
                                    mode = "hidden";
                                }
                                if (mode) {
                                    for (i = t.domNode.textTracks.length - 1; i >= 0; i--) {
                                        if (t.domNode.textTracks[i].kind == "captions") {
                                            t.domNode.textTracks[i].mode = mode;
                                        }
                                    }
                                }
                            }
                        });
            }
            if (t.domNode.textTracks) {
                for (i = t.domNode.textTracks.length - 1; i >= 0; i--) {
                    if (t.domNode.textTracks[i].kind == "captions") {
                        closedCaption.addClass('mejs-closed-caption-off').removeClass('mejs-closed-caption-disabled');
                        t.domNode.textTracks[i].mode = "hidden";
                    }
                }
            }
        }
    });

})(mejs.$);
