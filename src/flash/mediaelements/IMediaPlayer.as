package mediaelements {

public interface IMediaPlayer {

    /**
     * Set the URL of the media to be loaded and played.
     * TBD: What are the semantics of this?
     * NOTE: Currently a no-op.
     * @param url
     */
    function setSrc(url:String) : void;

    /**
     * Start loading the current media.
     * NOTE: Currently a no-op.
     */
    function loadMedia() : void;

    /**
     * Start playback of the current media.
     * If the media is not yet ready to play, playback will start when the media is ready.
     * NOTE: playVideo() is an alias for playMedia().
     */
    function playMedia() : void;
    function playVideo() : void;

    /**
     * Pause playback of the current media.
     * If the media is not yet ready to be paused, playback will be paused when the media is ready.
     * NOTE: pauseVideo() is an alias for pauseMedia().
     */
    function pauseMedia() : void;
    function pauseVideo() : void;

    /**
     * Stop playback of the current media.
     * NOTE: stopVideo() is an alias for stopMedia()
     */
    function stopMedia() : void;
    function stopVideo() : void;

    /**
     * Seek to the specified time in the current media, if within range.
     * Does not intentionally alter the state of the player, though if already
     * playing, it may go into a LOADING state before playback continues.
     * NOTE: seekTo() is an alias for setCurrentTime().
     * @param time
     */
    function setCurrentTime(time:Number) : void;
    function seekTo(time:Number) : void;

    /**
     * Sets the volume of the current media.
     * Ranges from 0 (silent) to 1 (full volume).
     * NOTE: for YouTube player, it range seems to be 0 (silent) to 100 (full volume).
     * @param volume
     */
    function setVolume(volume:Number) : void;

    /**
     * Mutes or unmutes the current media.
     * @param muted true => mute the media, false => unmute the media.
     * NOTE: mute() is an alias for setMuted(true) and unMute() is an alias for setMuted(false);
     */
    function setMuted(muted:Boolean) : void;
    function mute() : void;
    function unMute() : void;

    /**
     * Show or hide closed captions.
     * @param show
     */
    function showCaptions(show:Boolean) : void;

    /**
     * Set the size of the display of the current media.
     * @param width
     * @param height
     */
    function setVideoSize(width:Number, height:Number) : void;

    /**
     * Put the player into fullscreen mode.
     * @param fullScreen
     */
    function setFullscreen(fullScreen:Boolean) : void;

    /**
     * Hopefully, this will not be necessary, once the controls are in a Flash SWC.
     * @param x
     * @param y
     * @param visibleAndAbove
     */
    function positionFullscreenButton(x:Number, y:Number, visibleAndAbove:Boolean) : void;

    /**
     * Hopefully, this will not be necessary, once the controls are in a Flash SWC.
     */
    function hideFullscreenButton() : void;

}

}
