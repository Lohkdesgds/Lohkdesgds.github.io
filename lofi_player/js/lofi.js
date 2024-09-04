const tracks_name_beg = "tracks/track (";
const tracks_name_end = ").ogg";
const tracks_amount = 50;//587; // [1..X]

const tracks_list = [];
let tracks_loaded = 0;
let tracks_total_time = 0;


setup_page();
setTimeout(setup_audios, 500);

function setup_audios()
{
    const idx = tracks_list.length;

    if (idx == 0) {
        __set_status(`Preparing... 0%`);
    }

    if (idx >= tracks_amount) {
        return;
    }

    const url = __get_track_name(idx);
    tracks_list[idx] = new Audio();
    tracks_list[idx].addEventListener("loadedmetadata", function(ev){
        ++tracks_loaded;

        __set_status(`Preparing... ${Math.round(100.0 * (tracks_loaded) / tracks_amount)}%`);
        
        tracks_total_time += tracks_list[idx].duration;

        if (tracks_loaded == tracks_amount) {
            __set_status("Click the button to start the stream:");
            one_time_add_play_and_run();
            //tracks_list[0].play();
            
        }
    });
    tracks_list[idx].addEventListener("ended", function() {
        tracks_list[idx].pause();
        tracks_list[idx].currentTime = 0;
        const curr = __calc_track_and_time_now();
        tracks_list[curr[0]].play();
    });
    tracks_list[idx].src = url;

    setTimeout(setup_audios, 10);
}

function one_time_add_play_and_run()
{
    const btn = document.createElement("button");
    const root = document.getElementById("status_msg");

    btn.innerText = "Play";
    btn.addEventListener("click", function() {
        const curr = __calc_track_and_time_now();

        root.removeChild(btn);

        __set_volume_perc(__get_volume_perc()); // force update all

        __set_status("Playing indefinitely!");

        setTimeout(function() {
            const el = document.getElementById("status_msg");
            el.parentElement.removeChild(el);
        }, 2000);

        tracks_list[curr[0]].currentTime = curr[1];
        tracks_list[curr[0]].play();
    });

    root.insertBefore(btn, root.children[1]);
}

function setup_page() {

    const el2 = document.getElementById("slider_vol");

    if (el2) {
        el2.addEventListener("mousemove", trigger_volume_bar);
        el2.addEventListener("mousedown", trigger_volume_bar);
        el2.addEventListener("mouseup",   trigger_volume_bar);
        el2.addEventListener("mouseleave",trigger_volume_bar);

        __set_volume_perc(0.5);
    }

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

function trigger_volume_bar(ev)
{
    const res = common_filter_trigger(ev);
    if (res < 0.0) return;
    
    // res == vol, 0..1
    __set_volume_perc(res);
}


function __set_volume_perc(percx)
{
    const el = document.getElementById("slider_vol");
    if (!el) return;
    el.style.background="linear-gradient(90deg, " + el.getAttribute("colorhigh") + " " + (100 * (percx)) + "%, " + el.getAttribute("colorlow") + " " + (100 * (percx + 0.001)) + "%)";
    el.setAttribute("perc", 100 * percx);
    el.children[0].innerText = Math.round(percx * 100) + "%";

    for(let i = 0; i < tracks_list.length; ++i) {
        tracks_list[i].volume = percx;
    }
}

function __get_volume_perc()
{
    const el = document.getElementById("slider_vol");
    if (!el) return 0.5;
    return el.getAttribute("perc") * 0.01;
}

function __set_status(stat) {
    const el = document.getElementById("status_msg");
    if (!el) return;
    el.innerText = stat;
}

// from 0 to tracks_amount-1
function __get_track_name(idx) {
    if (typeof idx !== 'number' || idx < 0 || idx > tracks_amount) return "";
    return `${tracks_name_beg}${idx + 1}${tracks_name_end}`;
}

function __calc_track_and_time_now() {
    const time_now = Number(new Date()) * 0.001;
    let track_now = time_now % tracks_total_time;
    let idx = 0;

    for(; idx < tracks_amount; ++idx) {
        if (track_now > tracks_list[idx].duration) {
            track_now -= tracks_list[idx].duration;
        }
        else break;
    }

    return [idx, track_now];
}