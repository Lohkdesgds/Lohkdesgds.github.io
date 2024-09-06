const g = {
    began: false,
    track: {
        audio: null, 
        next: null,
        volume: (Number(lsw_get_cookie("lofi_player_volume_+1")) || 1.5) - 1.0,

        setVolume: function(vol) {
            if (vol <= 0.0) vol = 0.001;
            this.volume = vol;
            if (this.audio) this.audio.volume = vol;
            if (this.next) this.next.volume = vol;
            lsw_set_cookie("lofi_player_volume_+1", `${this.volume + 1.0}`);
        }
    },
    text: {
        element: document.getElementById("status_msg"),

        setText: function(str) {
            this.element.innerText = str;
        }
    },
    tools: {
        /* Constants */
        tracks_amount: list_of_names_index.length,
        /* Variables */
        total_time_to_play: 0,
        each_track_time: [],

        _getTrackPath: function(off) {
            if (typeof off !== 'number' || off < 0 || off > this.tracks_amount) return "";
            return `tracks/${list_of_names_index[off]}`;
        },
        _getTrackName: function(off) {
            if (typeof off !== 'number' || off < 0 || off > this.tracks_amount) return "";
            return list_of_names_index[off];
        },
        _getCalculateTrackNowAndNext: function() {
            const time_now = Number(new Date()) * 0.001;
            const factor = 11987;
            let time_full = time_now % this.total_time_to_play;
            let idx = 0;

            for(let i = 0; i < this.tracks_amount; ++i) {
                idx = (factor + idx) % this.tracks_amount;

                if (time_full > this.each_track_time[idx]) {
                    time_full -= this.each_track_time[idx];
                }
                else break;
            }

            const nxt = (factor + idx) % this.tracks_amount;

            return { idx: idx, time: time_full, next: nxt };
        },

        loadMetadata: function(cb)
        {
            const check = lsw_storage_get_from("lofi_player_db_props");

            if (check && check.tracks_amount === this.tracks_amount && 
                check.version === list_of_names_version) 
            {
                const all_tracks = lsw_storage_get_from("lofi_player_db_each_track_time");

                if (all_tracks.length === this.tracks_amount) {
                    console.log(`Found cache, matched version and numbers, using it instead.`);

                    this.each_track_time = all_tracks;
                    this.total_time_to_play = check.total_time;
                    if (typeof cb === 'function') cb("200.0");
                    return;
                }
            }

            this._loadMetadata(cb);
        },

        // Callback receives a number [0..100] representing progress.
        _loadMetadata: function(cb) {
            const idx = this.each_track_time.length;
            const name = this._getTrackPath(idx);

            if (name === "" || idx >= this.tracks_amount) {
                if (typeof cb === 'function') cb("100.0");
                lsw_storage_save_to("lofi_player_db_each_track_time", this.each_track_time);
                lsw_storage_save_to("lofi_player_db_props",
                    { 
                        total_time: this.total_time_to_play,
                        tracks_amount: this.tracks_amount,
                        version: list_of_names_version
                    });
                return;
            }

            console.log(`Loading ${name} (#${idx})...`);

            const audio = new Audio();
            audio.addEventListener("loadedmetadata", function(ev){
                if (typeof cb === 'function') {
                    const tens = Math.floor(1000.0 * idx / g.tools.tracks_amount);
                    const top = Math.floor(tens / 10);
                    const low = (tens - (top * 10));
                    cb(`${top}.${low}`);
                }
                
                g.tools.total_time_to_play += audio.duration;
                g.tools.each_track_time[idx] = audio.duration;

                setTimeout(function() { g.tools.loadMetadata(cb); }, 8);
            });
            audio.src = name;
        }
    },
    funny: {
        texts_randomized: [],

        makeTextsIfNeeded: function() {
            if (this.texts_randomized.length > 0) return;

            this.texts_randomized = [
                "Sorry for taking this long...",
                "I promise there is a cache now, just load once...",
                "First time here? I see...",
                "Please do not clear your cookies and data!...",
                "Blame GitHub for this slow load...",
                "There is a lot of music in here, I promise!...",
                "Preparing the terrain...",
                "Discovering the recipes...",
                "Tunneling your soul to the music...",
                "Connecting to Joe's house...",
                "Makin' my way downtown, walkin' fast...",
                "Almost there...",
                "Working on it...",
                "Please wait a bit more...",
                "I am getting there, trust me bro...",
                "Collecting materials...",
                "Compiling chrome in seconds...",
                "If this text updates sometimes, it's a good sign...",
                "Sometimes garbage collector slows down stuff...",
                "If you're on Safari, good luck..."
            ];

            _randArray(this.texts_randomized);
        },
        getRandomText: function (update_interval_sec) {
            const time = Math.floor((Number(new Date()) / 1000) / update_interval_sec) % this.texts_randomized.length;
            return this.texts_randomized[time];
        }
    },
    slider: {
        element: document.getElementById("slider_vol"),

        setup: function() {
            const percx = g.track.volume;

            this.element.addEventListener("mousemove", function(e){g.slider._eventHandler(e);});
            this.element.addEventListener("mousedown", function(e){g.slider._eventHandler(e);});
            this.element.addEventListener("mouseup",   function(e){g.slider._eventHandler(e);});
            this.element.addEventListener("mouseleave",function(e){g.slider._eventHandler(e);});

            this.element.style.background = 
                "linear-gradient(90deg, " +
                this.element.getAttribute("colorhigh") +
                " " +
                (100 * (percx)) +
                "%, " +
                this.element.getAttribute("colorlow") + 
                " " +
                (100 * (percx + 0.001)) + "%)";

            this.element.setAttribute("perc", 100 * percx);
            this.element.children[0].innerText = Math.round(percx * 100) + "%";

        },
        _eventHandler: function(ev) {
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
            ev.target.children[0].innerText = Math.round(percx * 100) + "%";

            g.track.setVolume(percx);
        }
    },

    prepareAll: function() {
        g.funny.makeTextsIfNeeded();
        g.tools.loadMetadata(function(perc) {        
            g.text.setText(`${g.funny.getRandomText(5)} ${perc}%`);
            if (perc >= 100.0) {
                if (perc == 100.0) g.text.setText("Good! Beginning stream...");
                else if (perc == 200.0) g.text.setText("Got cache! Let's go!");

                setInterval(check_track_prepare_next, 500);
            }
        });
    }
};

setup_all();

// called every so often:
function check_track_prepare_next()
{
    // { idx: idx, time: track_now, next: (idx + 1) % this.tracks_amount };
    const now = g.tools._getCalculateTrackNowAndNext();
    const name_now = g.tools._getTrackPath(now.idx); // track now
    const name_next = g.tools._getTrackPath(now.next);

    // begin situation
    if (!g.track.next) {
        console.log(`No next track found, loading "${name_now}" for now at "${now.time}" seconds of playback and "${name_next}" as next.`);
        g.track.audio = new Audio(name_now);
        g.track.next = new Audio(name_next);

        g.track.audio["LOFI_REFERENCE"] = name_now;
        g.track.next["LOFI_REFERENCE"] = name_next;

        g.track.audio.currentTime = now.time;
        g.track.audio.volume = g.track.volume;
        g.track.audio.play();
    }
    else if (g.track.next["LOFI_REFERENCE"] == name_now) {
        console.log(`Next matches now track, so playing "${name_now}" now and loading "${name_next}" as next.`);
        
        g.track.audio = g.track.next;
        g.track.audio.volume = g.track.volume;
        g.track.audio.play();
        g.track.next = new Audio(name_next);
        g.track.next["LOFI_REFERENCE"] = name_next;
    }

    const diff = Math.abs(g.track.audio.currentTime - now.time);

    if (diff > 2.0) {
        console.log(`Time diff between track and expected time is too high (${diff} sec). Trying to compensate lag...`);
        g.track.audio.currentTime = now.time;
        g.track.audio.volume = g.track.volume;
        g.track.audio.play();
    }

    const raw_name_track = g.tools._getTrackName(now.idx);
    const key = ", from Album ";
    const endd = ".ogg";
    const point = raw_name_track.indexOf(key);
    const name_trk = raw_name_track.substring(0, point);
    const name_album = raw_name_track.substring(point + key.length, raw_name_track.length - endd.length);

    g.text.setText(`${_sec2str(g.track.audio.currentTime)} -> ${name_trk} - ${name_album}`);
}

function setup_all() 
{
    g.text.setText("Please click anywhere to begin the load (Browsers don't like autoplay without an interaction first).");

    g.slider.setup();

    document.body.addEventListener("click", function(ev) {
        if (g.began) return;
        g.began = true;
        g.prepareAll();
    });
}

function _randArray(arr)
{
    // While there remain elements to shuffle...
    for (let currentIndex = arr.length; currentIndex != 0;) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [arr[currentIndex], arr[randomIndex]] = [
            arr[randomIndex], arr[currentIndex]];
    }
}

function _sec2str(seconds)
{
    return new Date(seconds * 1000).toISOString().slice(11, 19);
}