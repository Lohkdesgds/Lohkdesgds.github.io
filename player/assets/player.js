YouTube_setLogID('loglist');
    
    const http_vol_fixed = lsw_manage_get('vid_vol');
    let vid_vol = (http_vol_fixed == '') ? 5 : Math.floor(http_vol_fixed);
    let vid_id = lsw_manage_get('vid_id') || 'jfKfPfyJRdk';
    let vid_pl = lsw_manage_get('vid_pl');// || 'PLJGtI1TtwC21g9ePKmmaJgjxfqqn816gx'; // Plug & Play
    
    const txt_elem = document.getElementById('youtube_text');
    
    const command_history_max = 100;
    const command_history_db_nam = "lsw-yt_history";
    let command_history_obj = {idx: 0, arr: lsw_storage_get_from(command_history_db_nam, [])}; // idx => 0 is last
    
    var my_youtube = YouTube();
    
    // PROGRESS BAR AUTOMATIC
    var __lock_progress_bar = false;
    function format_num_zeros_str(num, min_zeros, max_len)
    {
        if (min_zeros == null) min_zeros = 0;
    
        const str_min = "" + num;
        if (str_min.length > min_zeros) return str_min;
        let str = "000000000000000" + str_min;
        let _final = str.substring(str.length - min_zeros);
        if (typeof max_len === 'number') _final = _final.substring(0, max_len);
        return _final;
    }
    function format_sec_to_time(time_sec_total, show_dec) {
        const time_ms = Math.floor(((time_sec_total * 1000) - Math.floor(time_sec_total * 1000)));
        const sec =     Math.floor(Math.floor(time_sec_total) % 60);
        const min =    Math.floor((Math.floor(time_sec_total) / 60) % 60);
        const hour =   Math.floor((Math.floor(time_sec_total) / 3600));
    
        return format_num_zeros_str(hour, 2) + ":" + format_num_zeros_str(min, 2) + ":" + format_num_zeros_str(sec, 2) + (show_dec === true ? (format_num_zeros_str(time_ms, 4, 4)) : "");
    }
    
    function progress_bar_auto_call()
    {
        setTimeout(progress_bar_auto_call, 250);
        try {
            if (!__lock_progress_bar) {
                youtube_progress.style.width = "" + (my_youtube.GetCurrentTime() * 100 / my_youtube.GetTotalTime()) + "%";
    
                progress_text.textContent = format_sec_to_time(my_youtube.GetCurrentTime()) + " / " + format_sec_to_time(my_youtube.GetTotalTime());
            }
            else {
                progress_text.textContent = "";
            }
        }
        catch(err) {
            console.log("[PROGRESSBAR] Failed to update (" + err + "). Queued for later.");
        }
    }
    setTimeout(progress_bar_auto_call, 2000);
    // ENDOF PROGRESS BAR AUTOMATIC
    
    
    function update_args_bar_url()
    {
        lsw_manage_get("vid_vol", vid_vol);
        if (my_youtube.m_recipe.type === 'video'){
            lsw_manage_get("vid_id", vid_id/*my_youtube.m_recipe.url*/);
            lsw_manage_get("vid_pl", null);
        } 
        else {
            lsw_manage_get("vid_pl", vid_pl/*my_youtube.m_recipe.url*/);
            lsw_manage_get("vid_id", null);
        }
    }
    
    function hide_or_show_next_prev(showw) {
        if (showw) {
            youtube_next.style.display = "inherit";
            youtube_prev.style.display = "inherit";
        }
        else {
            youtube_next.style.display = "none";
            youtube_prev.style.display = "none";
        }
    }
    
    function volume_callback(self, props) {
        const one_hund = Math.floor(props.px * 100.0);
        self.children[0].style.width = one_hund + "%";
    
        if (one_hund != vid_vol) {
            vid_vol = one_hund;
            my_youtube.SetVolume(one_hund);
            update_args_bar_url();
        }
    }
    function progress_callback(self, props) {
        self.children[0].style.width = (props.px * 100.0) + "%";
    
        __lock_progress_bar = props.on;
        if (!props.on) {
            my_youtube.SetCurrentTime(props.px * my_youtube.GetTotalTime());
        }
    }
    
    //lsw_make_slider_of('youtube_volume', 189, 0, function(w,h) {
    //    const w_int = Math.floor(w);
    //    if (w_int != vid_vol/*Math.floor(my_youtube.GetVolume())*/) {
    //        my_youtube.SetVolume(w_int);
    //        vid_vol = w_int;
    //        update_args_bar_url();
    //    }
    //});
    
    my_youtube.OnReady(function(){
        console.log('= OnReady!');
    
        my_youtube.SetVolume(vid_vol);
        my_youtube.Shuffle();
        my_youtube.Next(); 
        my_youtube.Play();
        txt_elem.innerHTML = "Ready! ...";
        volume_slider_inn.style.width = vid_vol + "%";
    });
    my_youtube.OnPlay(function(){ 
        console.log('= OnPlay!');
        my_youtube.SetVolume(vid_vol);
        txt_elem.innerHTML = "Playing";
    });
    my_youtube.OnPause(function(){ 
        console.log('= OnPause!');
        txt_elem.innerHTML = "Paused";
    });
    my_youtube.OnStop(function(){ 
        console.log('= OnStop!');
        txt_elem.innerHTML = "Stopped";
    });
    my_youtube.OnLoading(function(){ 
        console.log('= OnLoading');
        txt_elem.innerHTML = "Loading...";
    });
    my_youtube.OnLoadFail(function(){ 
        console.log('= OnLoadFail! Next');
        my_youtube.Next();
        txt_elem.innerHTML = "Error. Loading...";
        });
    
    if (vid_id === null) {
        my_youtube.Load(vid_pl, true, '0', '0');
        hide_or_show_next_prev(true);
    }
    else {
        my_youtube.Load(vid_id, false, '0', '0');
        hide_or_show_next_prev(false);
    }
    
    
    {
        const obj = document.getElementById("youtube_search");
        obj.addEventListener("keydown", function(e) {
            switch(e.key) {
            case "Enter":
                if (obj.value.length > 0) {
                    command_history_obj.arr[command_history_obj.arr.length] = obj.value;
                    command_history_obj.idx = 0;
    
                    if (command_history_obj.arr.length > command_history_max) command_history_obj.arr.splice(0, 1);
    
                    lsw_storage_save_to(command_history_db_nam, command_history_obj.arr);
    
                    //alert("ARR: " + JSON.stringify(command_history_obj.arr))
                }
                break;
            case "ArrowUp":
            case "Up":
                if (++command_history_obj.idx > command_history_obj.arr.length) {
                    obj.value = "";
                    command_history_obj.idx = 0;
                }
                else {
                    obj.value = command_history_obj.arr[command_history_obj.arr.length - (command_history_obj.idx)];
                }
                return;
            case "ArrowDown":
            case "Down":
                if (--command_history_obj.idx <= 0) {
                    obj.value = "";
                    command_history_obj.idx = 0;                
                }
                else {
                    obj.value = command_history_obj.arr[command_history_obj.arr.length - (command_history_obj.idx)];
                }
                return;
            default:
                return;
            }
    
            if (e.key !== "Enter") return;
    
            let val = obj.value;
            //const my_vol = my_youtube.GetVolume() || '5';
            my_youtube.Log("Parsing argument...");
    
            if (val.indexOf("/echo") === 0) {
                if (val === "/echo") {
                    my_youtube.Log("========================================");
                    my_youtube.Log("/echo index: shows about index of playlist");
                    my_youtube.Log("/echo volume: shows how volume works");
                    my_youtube.Log("/echo secret: shows secret codes available");
                    my_youtube.Log("Options available:");
                    my_youtube.Log("========================================");
                    obj.value = "";
                }
                else { // has args 
                    const args1 = val.substring(("/echo ").length);
    
                    if (args1.indexOf("secret") === 0) {
                        my_youtube.Log("========================================");
                        my_youtube.Log("23: Furality Sylva Event from VRChat (multiple DJs playlist)");
                        my_youtube.Log("13: Furality Legends Event from VRChat (multiple DJs playlist)");
                        my_youtube.Log("5:  LoFi Homework Radio playlist");
                        my_youtube.Log("4:  LoFi Girl Synthwave (LIVE infinite synthwave)");
                        my_youtube.Log("3:  Furality Luma Event from VRChat (multiple DJs playlist)");
                        my_youtube.Log("2:  Minecraft playlist");
                        my_youtube.Log("1:  LoFi Girl (LIVE infinite LoFi)");
                        my_youtube.Log("0:  Plug&Play playlist (common music)");
                        my_youtube.Log("Options available: (usage: '/secret &lt;number&gt;')");
                        my_youtube.Log("========================================");
                        obj.value = "/secret ";
                    }
                    else if (args1.indexOf("volume") === 0) {
                        my_youtube.Log("========================================");
                        my_youtube.Log("Get current volume in percentage.");
                        my_youtube.Log("========================================");
                        obj.value = "/volume";
                    }
                    else if (args1.indexOf("getinfo") === 0) {
                        my_youtube.Log("========================================");
                        //my_youtube.Log("- playlistindex: Get index of track from playlist");
                        //my_youtube.Log("- playlistid: Get playlist ID");
                        //my_youtube.Log("- videourl: Get video URL");
                        //my_youtube.Log("- currenttime: Get current time of track");
                        //my_youtube.Log("- duration: Get total time of current track");
                        //my_youtube.Log("Options available: (usage: '/getinfo &lt;option&gt;'");
                        my_youtube.Log("Get all available information, including track index, playlist ID, duration etc.");
                        my_youtube.Log("========================================");
                        obj.value = "/getinfo";
                    }
                    else {
                        obj.value = "Unknown command";
                    }
                }
                return;
            }
            else if (val.indexOf("/getinfo") === 0) {
                my_youtube.Log("========================================");
                my_youtube.Log("Properties:");
                
                const info = my_youtube.GetInfo();
    
                for(let i = 0; i < info.length; ++i)
                {
                    const prop = info[i];
                    my_youtube.Log(prop.prop + " = " + prop.value);
                }
    
                my_youtube.Log("========================================");
                obj.value = "";
                return;
            }
            else if (val.indexOf("/volume") === 0) {
                my_youtube.Log("========================================");
                my_youtube.Log("Volume: " + vid_vol + "%");
                my_youtube.Log("========================================");
                obj.value = "";
                return;
            }
            else if (val.indexOf("/secret ") === 0) { // uuuhhh secret owo
                const str = val.substring(("/secret ").length);
                if (str.length > 0) {
                    const numid = Number(str);                
                    
                    switch(numid) {
                    case 0:
                        val = "&list=PLJGtI1TtwC21g9ePKmmaJgjxfqqn816gx"; // plug and play
                        obj.value = "Plug&Play Playlist";
                        break;
                    case 1:
                        val = "&v=jfKfPfyJRdk"; // lofi
                        obj.value = "LoFi Girl LIVE";
                        break;
                    case 2:
                        val = "&list=PLefKpFQ8Pvy5aCLAGHD8Zmzsdljos-t2l"; // Minecraft
                        obj.value = "Minecraft Playlist";
                        break;
                    case 3:
                        val = "&list=PLQ0Jtiz7cXo9gSbZXpQQvuGpxVXWHIJLg"; // Flity Luma
                        obj.value = "Furality Luma VRChat party Playlist";
                        break;
                    case 4:
                        val = "&v=4xDzrJKXOOY"; // Synthwave
                        obj.value = "LOFI Girl Synthwave LIVE";
                        break;
                    case 5:
                        val = "&list=PLNL9210pN7vZOQWQKpc-_bhnuWncytzZT"; // Homework Radio
                        obj.value = "LOFI Homework Radio";
                        break;
                    case 13:
                        val = "&list=PLQ0Jtiz7cXo8tjrJoqQjVmI3NCXagGMIx"; // Flity Legends
                        obj.value = "Furality Legends VRChat party Playlist";
                        break;
                    case 23:
                        val = "&list=PLQ0Jtiz7cXo_CclC7QiBZ38h73bP3yZPK"; // Flity Sylva
                        obj.value = "Furality Sylva VRChat party Playlist";
                        break;
                    default:
                        obj.value = "Not yet implemented.";
                        return;
                    }
                }
            }
    
    
            let search = val.indexOf("list=");
            if (search != -1) {
                let subst = val.substring(search + 5);
                let finn = subst.indexOf("&");
                if (finn !== -1) subst = subst.substring(0, finn);
    
                my_youtube.Log("Playlist detected: " + subst);
                vid_id = null;
                vid_pl = subst;
                
                my_youtube.Load(vid_pl, true, '0', '0');
    
                update_args_bar_url();
                hide_or_show_next_prev(true);
    
                return;
            }
            search = val.indexOf("v=");
            if (search != -1) {
                let subst = val.substring(search + 2);
                let finn = subst.indexOf("&");
                if (finn !== -1) subst = subst.substring(0, finn);
    
                my_youtube.Log("Video detected: " + subst);
    
                vid_id = subst;
                //vid_pl = ""; // irrelevant
    
                my_youtube.Load(vid_id, false, '0', '0');
    
                update_args_bar_url();
                hide_or_show_next_prev(false);
    
                return;
            }
    
            my_youtube.Log("Failed to parse your argument. Try again");
            return;
        });
    }