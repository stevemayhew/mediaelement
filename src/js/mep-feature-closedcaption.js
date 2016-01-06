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
                                var showCaptions = closedCaption.is('.mejs-closed-caption-off');
                                closedCaption.toggleClass('mejs-closed-caption-on', showCaptions).toggleClass('mejs-closed-caption-off', !showCaptions);
                                media.showCaptions(showCaptions, t.domNode.textTracks);
                            }
                        });
                // TODO: This only needs to be done once, and should be specific to non-native (Flash) video player.
                // This event is generated by FlashMediaElement.
                media.addEventListener("captionInfo", function() {
                    closedCaption.addClass('mejs-closed-caption-off').removeClass('mejs-closed-caption-disabled');
                });
            }
            // TODO: This only needs to be done once, and should be specific to native (HTML5) video player.
            // This needs to be done after the first "captions" track has arrived.
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
