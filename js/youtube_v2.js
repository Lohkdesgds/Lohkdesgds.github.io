var __lsw_yt_loaded = -1;
var __lsw_yt_list = [];
var __lsw_yt_debug_list = null; // expects element of list to push <li>


function __lsw_zeroed_first(what, zeros){ if (typeof zeros !== 'number' || zeros < 1) zeros = 2; what = "" + what; while(what.length < zeros) what = "0" + what; return what; }
function __lsw_date_str() { const date_real = new Date(); return __lsw_zeroed_first(date_real.getFullYear(), 4) + "/" + __lsw_zeroed_first(date_real.getMonth() + 1) + "/" +  __lsw_zeroed_first(date_real.getDate()) + " " + __lsw_zeroed_first(date_real.getHours()) + "h" + __lsw_zeroed_first(date_real.getMinutes()) + "m" + __lsw_zeroed_first(date_real.getSeconds()) + "s"; }
function __lsw_yt_log(data){
    console.log("[YTAPI2] " + data);
    if (__lsw_yt_debug_list) { 
        let max = __lsw_yt_debug_list.getAttribute('maxlines');
        if (max <= 0) max = 20; 
        let elem = document.createElement("li");
        elem.innerHTML = ("<strong>[YTAPI2]</strong> " + __lsw_date_str() + " > " + data);
        __lsw_yt_debug_list.insertBefore(elem, __lsw_yt_debug_list.firstChild); }}
        if (__lsw_yt_debug_list.childElementCount > max) __lsw_yt_debug_list.erase(__lsw_yt_debug_list.lastChild);

function YouTube_setLogID(debug_list_id)
{
    if (typeof debug_list_id === 'string') {
        let elem = document.getElementById(debug_list_id);
        if (elem) __lsw_yt_debug_list = elem;
        __lsw_yt_log("Set up debug list element successfully");
    }
}

function YouTube(debug_list_id)
{
    YouTube_setLogID(debug_list_id);

    var obj = {
        m_recipe: {
            url: null,
            type: 'video', // or 'playlist'
            id: null, // if null, insert div somewhere
            width: '0',
            height: '0'
        },
        m_stat: {
            has_played_once: false,
            last_state: -2
        },

        m_player: null, // YouTube Player

        // Functions to be used
        Load: __lsw_yt_prepare,             // Load(url: id, is_playlist: bool(false), width: number(0), height: number(0))
        Play: __lsw_yt_play,                // Play()
        Pause: __lsw_yt_pause,              // Pause()
        Stop: __lsw_yt_stop,                // Stop()
        Next: __lsw_yt_next,                // Next()
        Previous: __lsw_yt_previous,        // Previous()
        Shuffle: __lsw_yt_shuffle,          // Shuffle()
        Loop: __lsw_yt_loop,                // Loop(do_loop: bool(true))
        PlayPause: __lsw_yt_play_pause,     // PlayPause()
        SetVolume: __lsw_yt_set_volume,     // SetVolume(volume: number)
        GetVolume: __lsw_yt_get_volume,     // GetVolume()
        OnPlay: __lsw_yt_on_play,           // OnPlay(cb: function)
        OnPause: __lsw_yt_on_pause,         // OnPause(cb: function)
        OnStop: __lsw_yt_on_stop,           // OnStop(cb: function)
        OnReady: __lsw_yt_on_ready,         // OnReady(cb: function)
        OnLoading: __lsw_yt_on_loading,     // OnLoading(cb: function)
        OnLoadFail: __lsw_yt_on_load_fail,  // OnReady(cb: function)

        // hooks
        m_hooks: {
            on_play: null,
            on_pause: null,
            on_stop: null,
            on_ready: null,
            on_loading: null,
            on_load_fail: null
        }
    };

    __lsw_yt_list[__lsw_yt_list.length] = obj;

    return obj;
}

function __lsw_yt_onReady(ev)
{
    __lsw_yt_log("# __ Youtube OnReady triggered");
    const plr = ev.target;

    for(let i = 0; i < __lsw_yt_list.length; ++i)
    {
        let obj = __lsw_yt_list[i];
        if (plr === obj.m_player) {
            obj.m_stat.last_state = -2; // reset state to ready thing
//
            if (obj.m_recipe.type == 'playlist') {
                __lsw_yt_log("Player id=" + obj.m_recipe.id + " ready as playlist! (" + obj.m_recipe.url + ")");
            //    plr.loadPlaylist(obj.m_recipe.url, 1);
            //    
                if (obj.m_hooks.on_ready !== null) obj.m_hooks.on_ready();
            }
            else {
                __lsw_yt_log("Player id=" + obj.m_recipe.id + " ready as video! (" + obj.m_recipe.url + ")");
            //    plr.loadVideoById(obj.m_recipe.url);
            //    
                if (obj.m_hooks.on_ready !== null) obj.m_hooks.on_ready();
            }
        }
    }
}
function __lsw_yt_onState()
{
    __lsw_yt_log("# __ Youtube OnState triggered");

    for(let i = 0; i < __lsw_yt_list.length; ++i) 
    {
        let obj = __lsw_yt_list[i];
        if (obj.m_player !== null) {
            const cur = obj.m_player.getPlayerState();
            const cpy = obj.m_stat.last_state;
            obj.m_stat.last_state = cur;

            //console.log("WUS: " + cpy + "; NOW: " + cur);

            if (cpy < -1 && (cur === 3 || cur < 0)) { // was failed, now not loaded -> force keep -3
                __lsw_yt_log("# __ > OnState: Loading");
                if (typeof obj.m_hooks.on_loading === 'function') obj.m_hooks.on_loading();
                obj.m_stat.last_state = -3;
            }
            else if (cpy === -1 && cur === 3) { // was none, now buffering -> loading
                __lsw_yt_log("# __ > OnState: Loading");
                if (typeof obj.m_hooks.on_loading === 'function') obj.m_hooks.on_loading();
            }
            else if (cpy === 3 && cur === -1) { // was buffering, now none -> failed
                __lsw_yt_log("# __ > OnState: LoadFail");
                if (typeof obj.m_hooks.on_load_fail === 'function') obj.m_hooks.on_load_fail();
                obj.m_stat.last_state = -2; // avoid loop
            }
            else if (cur === 1) { // can only be playing
                __lsw_yt_log("# __ > OnState: Play");
                if (typeof obj.m_hooks.on_play  === 'function') obj.m_hooks.on_play();
            }
            else if (cur === 2) { // can only be paused
                __lsw_yt_log("# __ > OnState: Pause");
                if (typeof obj.m_hooks.on_pause  === 'function') obj.m_hooks.on_pause();
            }
            else if (cur === 5) { // can only be stop
                __lsw_yt_log("# __ > OnState: Stop");
                if (typeof obj.m_hooks.on_stop  === 'function') obj.m_hooks.on_stop();
            }
            
        }
    }
}

function __lsw_yt_insert_youtube_script()
{
    if (__lsw_yt_loaded >= 0) return;
    __lsw_yt_loaded = 0;

    __lsw_yt_log("# Youtube insertScript triggered (should be once)");
    let el = document.createElement('script');
    el.src = "https://www.youtube.com/iframe_api";
    let se = document.getElementsByTagName('script')[0];
    se.parentNode.insertBefore(el, se);
    __lsw_yt_log("# Waiting for script to load now.");
}

function onYouTubeIframeAPIReady() {
    __lsw_yt_log("# Youtube iframeAPIReady triggered");
    __lsw_yt_loaded = 1;
    
    for(let i = 0; i < __lsw_yt_list.length; ++i) {
        __lsw_yt__auto_load(__lsw_yt_list[i]);
    }
}

function __lsw_yt__auto_load(obj, autodestroy)
{
    if (obj === null) return;

    if (obj.m_player !== null && autodestroy !== false) {
        obj.m_player.destroy();
    }

    if (obj.m_recipe.id === null) {
        obj.m_recipe.id = __lsw_yt_genname();
        __lsw_yt_log("Had to create new div, called: " + obj.m_recipe.id);

        let elem = document.createElement('div');
        elem.setAttribute('id', obj.m_recipe.id);

        document.body.append(elem);
        __lsw_yt_log("Integrated new div to body (" + obj.m_recipe.id + ")");
    }

    if (obj.m_recipe.width == null) obj.m_recipe.width = '0';
    if (obj.m_recipe.height == null) obj.m_recipe.height = '0';
    
    if (obj.m_recipe.type == 'playlist') {
        __lsw_yt_log("Player id=" + obj.m_recipe.id + " setting up as playlist (" + obj.m_recipe.url + ")[" + obj.m_recipe.width + "x" + obj.m_recipe.height + "]");
        
        obj.m_player = new YT.Player(obj.m_recipe.id,
            {
                width: obj.m_recipe.width,
                height: obj.m_recipe.height,
                videoId: 'jfKfPfyJRdk',
                playerVars: {
                    listType: 'playlist',
                    list: obj.m_recipe.url
                },
                events: {
                    'onReady': __lsw_yt_onReady,
                    'onStateChange': __lsw_yt_onState
                }
            }
        );
    }
    else {
        __lsw_yt_log("Player id=" + obj.m_recipe.id + " setting up as video. (" + obj.m_recipe.url + ")[" + obj.m_recipe.width + "x" + obj.m_recipe.height + "]");
        
        obj.m_player = new YT.Player(obj.m_recipe.id,
            {
                width: obj.m_recipe.width,
                height: obj.m_recipe.height,
                videoId: obj.m_recipe.url,
                events: {
                    'onReady': __lsw_yt_onReady,
                    'onStateChange': __lsw_yt_onState
                }
            }
        );        
    }
    
}


function __lsw_yt_prepare(url, is_playlist, width, height)
{
    __lsw_yt_log("% Load: (url:" + url + ", is_playlist:" + is_playlist + ", width:" + width + ", height:" + height + ")");
    if (url == null || is_playlist == null) return false;

    this.m_recipe.url = url;
    this.m_recipe.type = (is_playlist) ? 'playlist' : 'video';
    this.m_recipe.width = width === null ? '0' : width;
    this.m_recipe.height = height === null ? '0' : height;

    if (__lsw_yt_loaded === -1) { // let autoload do its thing
        __lsw_yt_insert_youtube_script();
    }
    else { // api ready to play
        __lsw_yt__auto_load(this);
    }
}
function __lsw_yt_play()
{
    __lsw_yt_log("% Play: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        this.m_player.playVideo();
        return true;
    }
    return false;
}
function __lsw_yt_pause()
{
    __lsw_yt_log("% Pause: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        this.m_player.pauseVideo();
        return true;
    }
    return false;
}
function __lsw_yt_stop()
{
    __lsw_yt_log("% Stop: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        this.m_player.stopVideo();
        return true;
    }
    return false;
}
function __lsw_yt_next()
{
    __lsw_yt_log("% Next: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null & this.m_recipe.type === 'playlist') {
        this.m_player.nextVideo();
        return true;
    }
    return false;
}
function __lsw_yt_previous()
{
    __lsw_yt_log("% Previous: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null & this.m_recipe.type === 'playlist') {
        this.m_player.previousVideo();
        return true;
    }
    return false;
}
function __lsw_yt_shuffle()
{
    __lsw_yt_log("% Shuffle: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null & this.m_recipe.type === 'playlist') {
        this.m_player.setShuffle(true);
        return true;
    }
    return false;
}
function __lsw_yt_loop(do_loop)
{
    __lsw_yt_log("% Loop: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null & this.m_recipe.type === 'playlist') {
        this.m_player.setLoop(do_loop);
        return true;
    }
    return false;
}
function __lsw_yt_play_pause()
{
    __lsw_yt_log("% PlayPause: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        if (this.m_stat.last_state === 1) {
            this.Pause();
        }
        else {
            this.Play();
        }
        return true;
    }
    return false;
}
function __lsw_yt_set_volume(volume)
{
    __lsw_yt_log("% SetVolume: (volume:" + volume + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        this.m_player.setVolume(volume);
        return true;
    }
    return false;
}
function __lsw_yt_get_volume()
{
    __lsw_yt_log("% GetVolume: [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (this.m_player !== null) {
        return this.m_player.getVolume();
    }
    return 0;
}
function __lsw_yt_on_play(cb) // 1
{
    __lsw_yt_log("% onPlay: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_play = cb;
    }
    else {
        this.m_hooks.on_play = null;
    }
}
function __lsw_yt_on_pause(cb) // 2
{
    __lsw_yt_log("% onPause: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_pause = cb;
    }
    else {
        this.m_hooks.on_pause = null;
    }
}
function __lsw_yt_on_stop(cb) // 0 or 5
{
    __lsw_yt_log("% onStop: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_stop = cb;
    }
    else {
        this.m_hooks.on_stop = null;
    }
}
function __lsw_yt_on_ready(cb) // 0 or 5
{
    __lsw_yt_log("% onReady: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_ready = cb;
    }
    else {
        this.m_hooks.on_ready = null;
    }
}
function __lsw_yt_on_loading(cb) // 0 or 5
{
    __lsw_yt_log("% onLoading: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_loading = cb;
    }
    else {
        this.m_hooks.on_loading = null;
    }
}
function __lsw_yt_on_load_fail(cb) // 0 or 5
{
    __lsw_yt_log("% onLoadFail: (function:" + (typeof cb === 'function' ? "YES" : "NULL") + ") [exists:" + (this.m_player === null ? "NULL" : "YES") + "]");
    if (typeof cb === 'function') {
        this.m_hooks.on_load_fail = cb;
    }
    else {
        this.m_hooks.on_load_fail = null;
    }
}
function __lsw_yt_genname() // make sure there is no
{
    while(1) {
        let newname = "lsw_yt_auto_" + (100000 + Math.floor(Math.random() * 900000));
        if (document.getElementById(newname) === null) return newname;
    }
}