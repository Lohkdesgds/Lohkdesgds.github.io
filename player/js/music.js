const __yt_props = {
    is_iframe: false,
    current_vol: 0.5,
    current_prog: 0.0,
    user_holding_prog: false,
    event_resize_id: 0,
    animation_live_interval_id: 0,
    input_hide_timeout_id: 0
};

const __yt_history = {
    idx: 0,
    was_shuffle: false,
    was_loop: false,
    last_volume: 0.5,
    list: []
};


auto_iframe();

function __hide_inputs(){
    const el = document.getElementById("search");
    const el2 = document.getElementById("control_bar");
    if (el == document.activeElement) {
        __yt_props.input_hide_timeout_id = setTimeout(__hide_inputs, 5000);
        return;
    }
    el.style.display = "none";
    el2.style.display = "none";
}

function auto_hide_input_event_handler()
{
    const el = document.getElementById("search");
    const el2 = document.getElementById("control_bar");
    el.style.display = "";
    el2.style.display = "";

    if (__yt_props.input_hide_timeout_id != 0) clearTimeout(__yt_props.input_hide_timeout_id);
    __yt_props.input_hide_timeout_id = setTimeout(__hide_inputs, 10000);
}

function remove_element_hidden(id) {
    const el = document.getElementById(id);
    //el.parentNode.removeChild(el);
    el.classList.remove("ym-hide");
}

function auto_iframe() {
    if (getParamValue("avali")) {
        html_root.classList.toggle("avali-font");
    }

    if (!is_iframe()) {
        document.body.classList.remove("iframed");

        load_from_localstorage();
        setup_buttons();
        setup_sliders();
        setup_input();
        setup_canvas_text();

        window.addEventListener("resize", on_resize);
        window.addEventListener("mousemove", auto_hide_input_event_handler);
        window.addEventListener("keypress", auto_hide_input_event_handler);

        on_resize(null);
        auto_hide_input_event_handler();
        trigger_yt_start();

        setInterval(check_if_youtube_size_is_zero_then_fix, 5000);
        setTimeout(page_loaded_flag, 50);

        return;
    }

    console.log("YourMusic loading on iframe mode...");
    console.log("Note: maximum recommended height for player: 109px (if you don't know)");

    const to_remove = document.querySelectorAll("[remove_on_iframe]");
    for(let i = 0; i < to_remove.length; ++i) to_remove[i].parentNode.removeChild(to_remove[i]);

    const to_show = document.querySelectorAll("[show_on_iframe]");
    for(let i = 0; i < to_show.length; ++i) to_show[i].classList.remove("ym-hide");
    
    setup_buttons();
    setup_sliders();
    setup_canvas_text();
    on_resize(null);
    
    const url = getParamValue("url"); // can be null
    const must_play = getParamValue("forceplay");

    console.log("Got param: " + url);
    custom_yt_start(url);

    if (must_play == "1" || must_play == "true") {
        console.log("Autoplay forced enabled.");
        let id = 0;
        id = setInterval(function() {
            if (!yt_is_playing()) yt_play();
            else {
                console.log("Accomplished autoplay forced.");
                clearInterval(id);
            }
        }, 500);
    }
    
    console.log("YourMusic good.");

    setTimeout(page_loaded_flag, 50);
}

function page_loaded_flag(){
    const el = document.querySelector("[class=\"ym-remove-on-load\"]");
    el.classList.remove("ym-remove-on-load");
}

function setup_canvas_text()
{    
    const canvas = document.getElementById("scrolling_text");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let offx = 0;
    setInterval(function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = html_root.classList.contains("avali-font") ? "22px AvaliScratch" : "16px 'Segoe UI Emoji', 'Segoe UI Variable', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

        let text = yt_is_playing() ? "Playing: " : "Paused: ";
        const player_el = document.getElementById("yt-player");
        if (player_el) {
            const val = player_el.getAttribute("title");
            if (val == null) text = "Loading...";
            else if (val == "YouTube video player") text = "Loaded player, waiting...";
            else text += val;
        }
        else {
            text = "Loading...?";
        }
        
        const sizing = ctx.measureText(text).width;

        ctx.fillStyle = 'black';
        ctx.fillText(text, offx + 1, 17);
        ctx.fillStyle = 'white';
        ctx.fillText(text, offx, 16);

        offx -= 2;
        if ((offx > canvas.width + 5) || ((offx + sizing) < -5)) offx = canvas.width + 5;
    }, 50);
}

function custom_yt_start(url)
{
    post_line("Trying to start YouTube API...")
    if (typeof yt_install === 'function') {
        if (!__yt_props.is_iframe) {
            yt_set_shuffle(__yt_history.was_shuffle);
            yt_set_repeat(__yt_history.was_loop);
            yt_set_volume(__yt_history.last_volume);//Math.pow(__yt_history.last_volume, 2)
        }

        yt_install(url);

        setInterval(__keep_timer_and_buttons_up_to_date, 1000);
    }
    else setTimeout(function(){ custom_yt_start(url);}, 500);

}

function trigger_yt_start()
{
    custom_yt_start(__yt_history.list.length > 0 ? work_on_command_or_link(__yt_history.list[__yt_history.list.length - 1]) : null);
}

function setup_buttons()
{
    const el_log = document.getElementById("loglisttoggle");
    const el_pls = document.getElementById("pl_show");
    const el_pbk = document.getElementById("pl_back");
    const el_ply = document.getElementById("pl_play");
    const el_pla = document.getElementById("pl_play_alt");
    const el_fwd = document.getElementById("pl_forw");
    const el_sfl = document.getElementById("pl_shuf");
    const el_rpt = document.getElementById("pl_rept");

    if (el_log) el_log.addEventListener("click", function(ev){
        const el = document.getElementById("loglist");
        
        if (ev.target.classList.contains("active")) {
            setTimeout(function() {el.style.display = "none";}, 1200);
            ev.target.innerText = "⚙️";
            el.classList.remove("ym-fadein");
            el.classList.add("ym-fadeout");
            ev.target.classList.toggle("active");
        } 
        else {
            el.style.display = "";
            ev.target.innerText = "❎";
            el.classList.add("ym-fadein");
            el.classList.remove("ym-fadeout");
            ev.target.classList.toggle("active");
        }
    });

    if (el_pls) el_pls.addEventListener("click", function(ev){
        const el = document.getElementById("yt-wrapper");
        
        if (ev.target.classList.contains("active")) {
            //el.style.opacity = "0";
            //el.style.display = "none";
            setTimeout(function() {el.style.display = "none";}, 1200);
            el.classList.remove("ym-fadein");
            el.classList.add("ym-fadeout");
            ev.target.innerText = "🔅";
            ev.target.classList.toggle("active");
            ev.target.classList.toggle("deactive");
        } 
        else {
            //el.style.opacity = "1";
            el.style.display = "";
            ev.target.innerText = "🔆";
            el.classList.add("ym-fadein");
            el.classList.remove("ym-fadeout");
            ev.target.classList.toggle("active");
            ev.target.classList.toggle("deactive");
            setTimeout(function(){ keep_things_aspect_ratio_up_to_date(false); }, 50);
        }
    });

    if (el_pbk) el_pbk.addEventListener("click", function(ev){
        yt_prev();
    });

    if (el_ply) el_ply.addEventListener("click", function(ev) {        
        if (yt_play_pause()) {
            el_ply.classList.add("active");
            el_ply.classList.remove("deactive");
        }
        else {
            el_ply.classList.remove("active");
            el_ply.classList.add("deactive");
        }
    });

    if (el_pla) el_pla.addEventListener("click", function(ev) {
        if (yt_play_pause()) {
            el_pla.classList.add("active");
            el_pla.classList.remove("deactive");
        }
        else {            
            el_pla.classList.remove("active");
            el_pla.classList.add("deactive");
        }
    });

    if (el_fwd) el_fwd.addEventListener("click", function(ev){
        yt_next();
    });

    if (el_sfl) el_sfl.addEventListener("click", function(ev){
        const is = !yt_get_shuffle();
        yt_set_shuffle(is);
        __yt_history.was_shuffle = is;
        save_to_localstorage();
        __keep_timer_and_buttons_up_to_date();
    });

    if (el_rpt) el_rpt.addEventListener("click", function(ev){
        const is = !yt_get_repeat();
        yt_set_repeat(is);
        __yt_history.was_loop = is;
        save_to_localstorage();
        __keep_timer_and_buttons_up_to_date();
    });
}

function common_filter_trigger(ev)
{
    if (ev.buttons == 0 && ev.type != "mouseup") return -1;
    if (ev.type == "mouseleave") return -1;

    const dx = ev.clientX;
    let percx = (dx - ev.target.offsetLeft) / ev.target.offsetWidth;
    if (percx < 0) percx = 0;
    if (percx > 1) percx = 1;

    ev.target.style.background = 
        "linear-gradient(90deg, " + ev.target.getAttribute("colorhigh") + " " + (100 * (percx)) + "%, " +
        ev.target.getAttribute("colorlow") + " " + (100 * (percx + 0.001)) + "%)";
    
    ev.target.setAttribute("perc", 100 * percx);

    return percx;
}

function trigger_progress_bar(ev)
{
    const res = common_filter_trigger(ev);
    if (res < 0.0) {
        if (__yt_props.user_holding_prog) {
            yt_seek_to_secs(__yt_props["current_prog"] * yt_get_duration_secs());
        }
        __yt_props.user_holding_prog = false;
        return;
    }
    __yt_props.user_holding_prog = true;
    
    __set_playback_perc(res);
}

function trigger_volume_bar(ev)
{
    const res = common_filter_trigger(ev);
    if (res < 0.0) return;
    
    __set_volume_perc(res);
    __yt_history.last_volume = res;
    save_to_localstorage();
    yt_set_volume(res); // Math.pow(res, 2)
}

function setup_sliders()
{
    const el1 = document.getElementById("slider_progress");
    const el2 = document.getElementById("slider_vol");

    if (el1) {
        el1.addEventListener("mousemove", trigger_progress_bar);
        el1.addEventListener("mousedown", trigger_progress_bar);
        el1.addEventListener("mouseup",   trigger_progress_bar);
        el1.addEventListener("mouseleave",trigger_progress_bar);
    }

    if (el2) {
        el2.addEventListener("mousemove", trigger_volume_bar);
        el2.addEventListener("mousedown", trigger_volume_bar);
        el2.addEventListener("mouseup",   trigger_volume_bar);
        el2.addEventListener("mouseleave",trigger_volume_bar);
    }

    __set_playback_perc(0.0);
    __set_volume_perc(__yt_history.last_volume);
}

function setup_input() {
    const elsrc = document.getElementById("search");
    if (!elsrc) return;

    elsrc.addEventListener("keydown", function(e) {
        switch(e.key) {
        case "Enter":
            if (e.target.value.length > 0 && (e.target.value.indexOf("/avalifont") != 0)) {
                __yt_history.list[__yt_history.list.length] = e.target.value;
                __yt_history.idx = 0;

                save_to_localstorage();

                yt_play_url(e.target.value);
            } 
            break;
        case "ArrowUp":
        case "Up":
            if (++__yt_history.idx > __yt_history.list.length) {
                e.target.value = "";
                __yt_history.idx = 0;
            }
            else {
                e.target.value = __yt_history.list[__yt_history.list.length - (__yt_history.idx)];
            }
            return;
        case "ArrowDown":
        case "Down":
            if (--__yt_history.idx <= 0) {
                e.target.value = "";
                __yt_history.idx = 0;
            }
            else {
                e.target.value = __yt_history.list[__yt_history.list.length - (__yt_history.idx)];
            }
            return;
        default:
            return;
        }

        if (e.key !== "Enter") return;
        e.target.value = work_on_command_or_link(e.target.value);
        if (e.target.value.length > 0) yt_play_url(e.target.value);
    });
}

function work_on_command_or_link(val)
{
    if (val.indexOf("/secret ") == 0)
    {
        const str = val.substring(("/secret ").length);
        if (str.length > 0) {
            const numid = Number(str);
            
            switch(numid) {
            case 0:
                return ("&list=PLJGtI1TtwC21g9ePKmmaJgjxfqqn816gx"); // plug and play
                //e.target.value = "Plug&Play Playlist";
                //break;
            case 1:
                return ("&v=jfKfPfyJRdk"); // lofi
                //e.target.value = "LoFi Girl LIVE";
                //break;
            case 2:
                return ("&list=PLefKpFQ8Pvy5aCLAGHD8Zmzsdljos-t2l"); // Minecraft
                //e.target.value = "Minecraft Playlist";
                //break;
            case 3:
                return ("&list=PLQ0Jtiz7cXo9gSbZXpQQvuGpxVXWHIJLg"); // Flity Luma
                //e.target.value = "Furality Luma VRChat party Playlist";
                //break;
            case 4:
                return ("&v=4xDzrJKXOOY"); // Synthwave
                //e.target.value = "LOFI Girl Synthwave LIVE";
                //break;
            case 5:
                return ("&list=PLNL9210pN7vZOQWQKpc-_bhnuWncytzZT"); // Homework Radio
                //e.target.value = "LOFI Homework Radio";
                //break;
            case 13:
                return ("&list=PLQ0Jtiz7cXo8tjrJoqQjVmI3NCXagGMIx"); // Flity Legends
                //e.target.value = "Furality Legends VRChat party Playlist";
                //break;
            case 23:
                return ("&list=PLQ0Jtiz7cXo_CclC7QiBZ38h73bP3yZPK"); // Flity Sylva
                //e.target.value = "Furality Sylva VRChat party Playlist";
                //break;
            default:
                break;
            }
        }
    }
    else if (val.indexOf("/avalifont") == 0) { // fun
        html_root.classList.toggle("avali-font");
        return "";
    }
    return val;
}

function on_resize(event)
{
    if (__yt_props.event_resize_id != 0) clearTimeout(__yt_props.event_resize_id);
    __yt_props.event_resize_id = setTimeout(function(){keep_things_aspect_ratio_up_to_date(true);}, 300);
}

function check_if_youtube_size_is_zero_then_fix()
{
    const base = document.getElementById("yt-player");
    if (base == null) return;
    if (base.style.height == "0px" || base.style.height == "0") {
        keep_things_aspect_ratio_up_to_date(false);
    }
}

function keep_things_aspect_ratio_up_to_date(real_event)
{
    const base = document.getElementById("yt-player");
    if (base) {
        base.style.height = Math.round((base.offsetWidth / 16) * 9) + "px";
        base.setAttribute("currentheight", Math.round((base.offsetWidth / 16) * 9) + "px");
    }

    if (real_event === true) {
        const htmlCanvas = document.getElementById("scrolling_text");
        if (htmlCanvas) {
            htmlCanvas.width = htmlCanvas.offsetWidth;
            htmlCanvas.height = htmlCanvas.offsetHeight;
        }
    }
}

function __keep_timer_and_buttons_up_to_date()
{
    if (typeof yt_get_progress_perc !== 'function') return; // wait

    if (!__yt_props.user_holding_prog) __set_playback_perc(yt_get_progress_perc());

    const el_ply = document.getElementById("pl_play");
    const el_pbk = document.getElementById("pl_back");
    const el_fwd = document.getElementById("pl_forw");    
    const el_sfl = document.getElementById("pl_shuf");
    const el_rpt = document.getElementById("pl_rept");
    
    if (el_ply) {
        if (yt_is_playing()) {
            el_ply.classList.add("active");
            el_ply.classList.remove("deactive");
        }
        else {
            el_ply.classList.remove("active");
            el_ply.classList.add("deactive");
        }
    }

    if (yt_get_is_playlist()) {
        if (el_pbk) el_pbk.classList.remove("disabled");
        if (el_fwd) el_fwd.classList.remove("disabled");
        if (el_sfl) el_sfl.classList.remove("disabled");

        if (yt_get_shuffle()) {
            if (el_sfl) {
                el_sfl.classList.add("active");
                el_sfl.classList.remove("deactive");
            }
        }
        else {
            if (el_sfl) {
                el_sfl.classList.remove("active");
                el_sfl.classList.add("deactive");
            }
        }
    }
    else {
        if (el_pbk) el_pbk.classList.add("disabled");
        if (el_fwd) el_fwd.classList.add("disabled");
        if (el_sfl) {
            el_sfl.classList.add("disabled");
            el_sfl.classList.remove("active");
            el_sfl.classList.remove("deactive");
        }
    }

    if (el_rpt) {
        if (yt_get_repeat()) {
            el_rpt.classList.add("active");
            el_rpt.classList.remove("deactive");
        }
        else {        
            el_rpt.classList.remove("active");
            el_rpt.classList.add("deactive");
        }
    }
}

function __set_playback_perc(percx)
{
    const el = document.getElementById("slider_progress");
    if (!el) return;

    if (typeof yt_get_is_livestream === 'function' && yt_get_is_livestream()) {
        percx = 1.0;
        const cur = yt_get_current_time_obj();
        if (cur.days + "" == "NaN") el.children[0].innerText = "Loading...";
        else if (ys_has_video_failed()) el.children[0].innerText = "Waiting for load...";
        else el.children[0].innerText = "LIVE for " + (cur.days > 0 ? (cur.days + " day(s), ") : "") + pad(cur.hours, 2) + ":" + pad(cur.minutes, 2) + ":" + pad(cur.seconds, 2);

        if (__yt_props.animation_live_interval_id != 0) clearInterval(__yt_props.animation_live_interval_id);
        __yt_props.animation_live_interval_id = setInterval(function(){
            const range_bar = -3; // lower means more walking
            const fade_len = 25; // from calculated value to sides
            const fade_in = 8; // 10 to left, 10 to right, central bar

            const ma = 50 + (50 - (fade_len / 2) - range_bar) * Math.cos(new Date() / 1000);
            const la1 = ma - fade_len;
            const la2 = ma + fade_len;

            el.style.background = 
                "linear-gradient(90deg, " + 
                    el.getAttribute("colorliveback") + " " + la1 + "%, " +
                    (el.getAttribute("colorlivehighlight") + " " + (ma - fade_in) + "%") + ", " +
                    (el.getAttribute("colorlivehighlight") + " " + (ma + fade_in) + "%") + ", " +
                    el.getAttribute("colorliveback") + " " + la2 + "%)";
        }, 30);
        
    }
    else {
        if (__yt_props.animation_live_interval_id != 0) clearInterval(__yt_props.animation_live_interval_id);
        __yt_props.animation_live_interval_id = 0;

        if (typeof yt_get_relative_duration_time_obj_from_perc === 'function') {
            const cur = yt_get_relative_duration_time_obj_from_perc(percx);

            if (cur.days + "" == "NaN") el.children[0].innerText = "Loading...";
            else if (ys_has_video_failed()) el.children[0].innerText = "Waiting for load...";
            else el.children[0].innerText = (cur.days > 0 ? (cur.days + "d ") : "") + pad(cur.hours, 2) + ":" + pad(cur.minutes, 2) + ":" + pad(cur.seconds, 2);
        }

        el.style.background = "linear-gradient(90deg, " + el.getAttribute("colorhigh") + " " + (100 * (percx)) + "%, " + el.getAttribute("colorlow") + " " + (100 * (percx + 0.001)) + "%)";
    }

    
    el.setAttribute("perc", 100 * percx);
    
    __yt_props["current_prog"] = percx;    
}

function __set_volume_perc(percx)
{
    const el = document.getElementById("slider_vol");
    if (!el) return;
    el.style.background="linear-gradient(90deg, " + el.getAttribute("colorhigh") + " " + (100 * (percx)) + "%, " + el.getAttribute("colorlow") + " " + (100 * (percx + 0.001)) + "%)";
    el.setAttribute("perc", 100 * percx);
    el.children[0].innerText = Math.round(percx * 100) + "%";
    __yt_props["current_vol"] = percx;
}

function getParamValue(paramName)
{
    var url = window.location.search.substring(1); //get rid of "?" in querystring
    var qArray = url.split('&'); //get key-value pairs
    for (var i = 0; i < qArray.length; i++) 
    {
        var pArr = qArray[i].split('='); //split key and value
        if (pArr[0] == paramName) 
            return pArr[1]; //return value
    }
    return null;
}

function post_line(text) {
    const el = document.getElementById("loglist");
    if (!el) return;

    if (el.children.length > el.getAttribute("maxlines")) el.removeChild(el.children[el.children.length - 1]);

    const nel = document.createElement("li");

    const dat = new Date();
    const str = pad(dat.getHours(), 2) + ":" + pad(dat.getMinutes(), 2) + ":" + pad(dat.getSeconds(), 2);

    nel.setAttribute("date", str);
    nel.innerText = text;

    el.insertBefore(nel, el.children[0]);
}

function pad(num, len) {
    const st = "" + num;
    if (st.length >= len) return st;
    var s = "00000000" + num;
    return s.substring(s.length - len);
}

function is_iframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function load_from_localstorage()
{
    if (__yt_props.is_iframe) return;
    const i = localStorage.getItem("youtube_history_flat");
    if (i == null) return;

    const j =  JSON.parse(i);
    __yt_history.list = j.list;
    __yt_history.idx = j.idx;
    __yt_history.was_shuffle = j.was_shuffle;
    __yt_history.was_loop = j.was_loop;
    __yt_history.last_volume = j.last_volume;
}

function save_to_localstorage()
{
    if (__yt_props.is_iframe) return;
    localStorage.setItem("youtube_history_flat", JSON.stringify(__yt_history));
}