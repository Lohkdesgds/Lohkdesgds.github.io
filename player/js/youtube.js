const yt_data = {
    has_triggered_install: false,
    install_triggered_ready: false,
    player_itself: null,
    user_props : {
        autoplay: true,
        is_shuffle: false,
        is_loop: false,
        volume: 0.25,
        start_with_url: "&v=jfKfPfyJRdk",
        is_livestream: false, // sets to -1 when buffering, if on event 1 it goes over 10 sec, assume livestream (true) or else (false)
        is_playlist: false,
        is_paused: false
    }
};

function yt_install(begin_with_url)
{   
    post_line_and_console("Initializing YouTube API...");
    
    if (typeof begin_with_url === 'string') yt_data.user_props.start_with_url = begin_with_url;

    let el = document.createElement('script');
    el.src = "https://www.youtube.com/iframe_api";
    el.setAttribute("does_youtube_exist", "true");
    let se = document.getElementsByTagName('script')[0];
    se.parentNode.insertBefore(el, se);
    yt_data.has_triggered_install = true;
    post_line_and_console("Waiting for YouTube API start...");
}

function yt_is_installed()
{
    const el = document.querySelector("[does_youtube_exist=\"true\"]");
    return el != null;
}

function yt_play_url(id)
{    
    yt_data.user_props.is_livestream = -2;
    if (yt_data.player_itself != null) yt_data.player_itself.destroy();
    
    if (id.indexOf("list=") != -1) {
        //yt_data.player_itself.loadPlaylist(id); // https://www.youtube.com/watch?v=qq-RGFyaq0U&list=PLefKpFQ8Pvy5aCLAGHD8Zmzsdljos-t2l
        yt_data.user_props.is_playlist = true;
        const cparam = _pop_data_from_url(id, "list=");
        post_line_and_console("Detected playlist: " + cparam + ". Reload and start...");
        yt_data.player_itself = new YT.Player('yt-player', {
            width: '100%',
            height: '100%',
            videoId: _pop_data_from_url(id, "v=", 'jfKfPfyJRdk'),
            playerVars: {
              'playsinline': 1,
              listType: 'playlist',
              list: cparam
            },
            events: {
              'onReady': __yt_on_ready,
              'onStateChange': __yt_on_state,
              'onError': __yt_on_error
            }
        });
    }
    else {
        //yt_data.player_itself.loadVideoByUrl(id); // https://www.youtube.com/watch?v=0w8SsT0xsWs'
        yt_data.user_props.is_playlist = false;
        const cparam = _pop_data_from_url(id, "v=");
        post_line_and_console("Detected not a playlist: " + cparam + ". Reload and start...");
        yt_data.player_itself = new YT.Player('yt-player', {
            width: '100%',
            height: '100%',
            videoId: cparam,
            playerVars: {
              'playsinline': 1
            },
            events: {
              'onReady': __yt_on_ready,
              'onStateChange': __yt_on_state,
              'onError': __yt_on_error
            }
        });
    }
}

function yt_play()
{
    if (yt_data.player_itself == null) return;
    yt_data.player_itself.playVideo();
}
function yt_pause()
{
    if (yt_data.player_itself == null) return;
    yt_data.player_itself.pauseVideo();
}

function yt_play_pause()
{
    if (yt_data.player_itself == null) return;

    const stat = yt_data.player_itself.getPlayerState();
    if (stat == 1 || stat == 3) { // playing or buffering
        yt_data.player_itself.pauseVideo();
        post_line_and_console("Paused video.");
        return false;
    }
    else {
        yt_data.player_itself.playVideo();
        post_line_and_console("Resumed video.");
        return true;
    }
}

function yt_next()
{
    if (yt_data.player_itself == null) return;
    yt_data.player_itself.nextVideo();
}
function yt_prev()
{
    if (yt_data.player_itself == null) return;
    yt_data.player_itself.previousVideo();
}
function yt_set_shuffle(on)
{
    yt_data.user_props.is_shuffle = on === true;
    if (yt_data.player_itself == null) return;
    
    yt_data.player_itself.setShuffle(yt_data.user_props.is_shuffle);

    if (yt_data.user_props.is_shuffle) {
        yt_data.player_itself.nextVideo();
    }
}
function yt_set_repeat(on)
{
    yt_data.user_props.is_loop = on === true;
    if (yt_data.player_itself == null) return;
    
    if (yt_data.user_props.is_loop) yt_data.player_itself.setLoop(true);
}
function yt_get_shuffle()
{
    return yt_data.user_props.is_shuffle;
}
function yt_get_repeat()
{
    return yt_data.user_props.is_loop;
}


function yt_set_volume(vol_perc_zero_to_one)
{
    yt_data.user_props.volume = vol_perc_zero_to_one;
    if (yt_data.player_itself != null) yt_data.player_itself.setVolume(Math.round(yt_data.user_props.volume * 100));
}

function yt_seek_to_secs(time_secs)
{
    if (yt_data.user_props.is_livestream !== true) yt_data.player_itself.seekTo(time_secs);
}

function yt_get_current_time_secs()
{
    return yt_data.player_itself.getCurrentTime();
}

function yt_get_duration_secs()
{
    return yt_data.player_itself.getDuration();
}

function yt_get_duration_time_obj()
{
    let ans = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    const total_sec = yt_data.player_itself.getDuration();
    ans.seconds = Math.floor(total_sec % 60);
    ans.minutes = Math.floor((total_sec / 60) % 60);
    ans.hours = Math.floor((total_sec / 3600) % 24);
    ans.days = Math.floor((total_sec / 86400));

    return ans;
}

function yt_get_relative_duration_time_obj_from_perc(x)
{
    if (yt_data.player_itself == null || typeof yt_data.player_itself["getDuration"] !== 'function') return 0;

    let ans = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    const total_sec = yt_data.player_itself.getDuration() * x;
    ans.seconds = Math.floor(total_sec % 60);
    ans.minutes = Math.floor((total_sec / 60) % 60);
    ans.hours = Math.floor((total_sec / 3600) % 24);
    ans.days = Math.floor((total_sec / 86400));

    return ans;
}

function yt_get_current_time_obj()
{
    if (yt_data.player_itself == null || typeof yt_data.player_itself["getCurrentTime"] !== 'function') return 0;

    let ans = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    };

    const total_sec = yt_data.player_itself.getCurrentTime();
    ans.seconds = Math.floor(total_sec % 60);
    ans.minutes = Math.floor((total_sec / 60) % 60);
    ans.hours = Math.floor((total_sec / 3600) % 24);
    ans.days = Math.floor((total_sec / 86400));

    return ans;
}

function yt_get_is_livestream()
{
    return yt_data.user_props.is_livestream === true;
}
function yt_get_is_playlist()
{
    return yt_data.user_props.is_playlist === true;
}
function yt_is_playing()
{
    return yt_data.player_itself == null ? false : (typeof yt_data.player_itself["getPlayerState"] === 'function' ? (yt_data.player_itself.getPlayerState() !== 2 && yt_data.player_itself.getPlayerState() !== -1) : false);
}
function ys_has_video_failed()
{
    return yt_data.player_itself == null ? true : (typeof yt_data.player_itself["getPlayerState"] === 'function' ? (yt_data.player_itself.getPlayerState() < 0) : true);
}

function yt_get_progress_perc()
{
    return yt_data.player_itself == null ? 0 : (typeof yt_data.player_itself["getCurrentTime"] === 'function' && typeof yt_data.player_itself["getDuration"] === 'function' ? (yt_data.player_itself.getCurrentTime() / yt_data.player_itself.getDuration()) : 0);
}

function __yt_on_ready(event) {
    post_line_and_console("YouTube API ready. Setting up parameters...");

    if (yt_data.user_props.autoplay) {
        yt_data.player_itself.playVideo();
        post_line_and_console("Autoplay attempted to auto play the video.");
    }
    
    if (yt_data.user_props.is_loop === true) {
        post_line_and_console("Last setting has loop on. Set.");
        yt_set_repeat(true);
    }

    if (yt_data.user_props.is_shuffle === true && yt_data.user_props.is_playlist === true) {
        post_line_and_console("Last setting has shuffle on. Working on it.");
        yt_set_shuffle(true);
    }
    
    yt_set_volume(yt_data.user_props.volume);

    post_line_and_console("Done setting up parameters.");
}

function __yt_on_state(event)
{
    //console.log("Data: " + event.data);

    if (yt_data.player_itself == null) return;

    switch(event.data) {
    case -1:
        yt_data.user_props.is_paused = false;
        break;
    case 0:
        break;
    case 1:
        if (!yt_data.user_props.is_paused) {
            if (yt_data.user_props.is_livestream == -1) yt_data.user_props.is_livestream = (yt_data.player_itself.getCurrentTime() > 10);
            else yt_data.user_props.is_livestream = false;
        }
        yt_data.player_itself.setVolume(Math.round(yt_data.user_props.volume * 100));
        setTimeout(function(){ yt_data.player_itself.setVolume(Math.round(yt_data.user_props.volume * 100)); }, 500);

        if (yt_data.player_itself.getCurrentTime() > 43200 /* 12 hours, max upload time raw (or 256 GB) */) yt_data.user_props.is_livestream = true;
        
        yt_data.user_props.is_paused = false;
        break;
    case 2: // pause
        yt_data.user_props.is_paused = true;
        break;
    case 3:
        if (!yt_data.user_props.is_paused && yt_data.user_props.is_livestream === -2) yt_data.user_props.is_livestream = -1;
        break;
    }
}
function __yt_on_error(event)
{
    if (yt_data.player_itself == null) return;

    switch(event.data) {
    case 2:
        post_line_and_console("ERROR: The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks. (" + yt_data.player_itself.getVideoUrl() + ")");
        if (yt_data.user_props.is_playlist) setTimeout(function() {yt_data.player_itself.nextVideo();}, 500);
        break;
    case 5:
        post_line_and_console("ERROR: The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred. (" + yt_data.player_itself.getVideoUrl() + ")");
        if (yt_data.user_props.is_playlist) setTimeout(function() {yt_data.player_itself.nextVideo();}, 500);
        break;
    case 100:
        post_line_and_console("ERROR: The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private. (" + yt_data.player_itself.getVideoUrl() + ")");
        if (yt_data.user_props.is_playlist) setTimeout(function() {yt_data.player_itself.nextVideo();}, 500);
        break;
    case 101:
    case 150:
        post_line_and_console("ERROR: The owner of the requested video does not allow it to be played in embedded players. (" + yt_data.player_itself.getVideoUrl() + ")");
        if (yt_data.user_props.is_playlist) setTimeout(function() {yt_data.player_itself.nextVideo();}, 500);
        break;
    }
}

function _pop_data_from_url(s, param, fallback)
{
    const it = s.indexOf(param);
    if (it == -1) return fallback ? fallback : s;
    const it2 = s.indexOf("&", it);    
    return it2 == -1 ? s.substring(it + param.length) : s.substring(it + param.length, it2);
}

function onYouTubeIframeAPIReady()
{
    yt_data.install_triggered_ready = true;
    yt_play_url(yt_data.user_props.start_with_url); // ex 2: 0w8SsT0xsWs
}

function post_line_and_console(text)
{
    if(typeof post_line === 'function') post_line(text);
    console.log("[YT] " + text);
}