/*
 * Copyright 2015 TiVo Inc. All Rights Reserved.
 */
package htmlelements.HLS {
import org.mangui.hls.event.HLSLoadMetrics;

public class FragmentLoadMetrics {

    /* level this fragment was loaded for */
    public var level : int;

    /* seq # of fragment */
    public var id : int;

    /** fragment size in bytes **/
    public var size : int;

    /** fragment/playlist duration  **/
    public var duration : Number;

    /** portion of network load time that is latency in ms (time from queued to first byte received */
    public var latency : int;

    /** network load time in ms (time from queued to first byte received */
    public var loadTime : int;

    /** parsing time (time to convert to FLV tags */
    public var parseTime : int;

    public function FragmentLoadMetrics(metrics:HLSLoadMetrics) {
        level = metrics.level;
        id = metrics.id;
        size = metrics.size;
        duration = metrics.duration;
        latency = metrics.loading_begin_time - metrics.loading_request_time;
        loadTime = metrics.loading_end_time - metrics.loading_request_time;
        parseTime = metrics.parsing_end_time - metrics.loading_end_time;
    }
}
}
