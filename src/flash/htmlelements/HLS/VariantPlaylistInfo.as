/*
 * Copyright 2015 TiVo Inc. All Rights Reserved.
 */
package htmlelements.HLS {
import org.mangui.hls.model.Level;

public class VariantPlaylistInfo {

    public var bitrate: uint;
    public var name: String;

    /** order from the original Manifest */
    public var manifestOrder: int;

    /** Video size */
    public var width: int;
    public var height: int;

    public function VariantPlaylistInfo(hlsLevel: Level) {
        bitrate = hlsLevel.bitrate;
        name = hlsLevel.name;
        width = hlsLevel.width;
        height = hlsLevel.height;
        manifestOrder = hlsLevel.manifest_index;
    }
}
}
