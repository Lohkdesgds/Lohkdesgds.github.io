// Common tools used everywhere.
// Functions starting with __ are "internal"
// All functions should be IE11 compatible.
// LSW V1.0 JS

// ======================== INTERNAL FUNCTIONS ======================== //

function __lsw_parse_xml(xml, tag) {// fully compatible IE11
    let test = xml.substring(xml.indexOf(tag)); // like d:Title
    return test.substring(test.indexOf(">") + 1, test.indexOf("<"));
}


// ======================== INTERNET EXPLORER 11 MODE EXTRAS ======================== //
// References:
// - https://stackoverflow.com/questions/19999388/check-if-user-is-using-ie

function lsw_detect_ie() {
    let ua = window.navigator.userAgent;

    let msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    let trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        let rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    let edge = ua.indexOf('Edge/');
    if (edge > 0) {
        // Edge => return version number
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

// ======================== PAGE MANAGEMENT ======================== //
// References:
// - https://stackoverflow.com/questions/8055791/how-to-keep-url-parameters-on-javascript-redirect
// - https://stackoverflow.com/questions/45758837/script5009-urlsearchparams-is-undefined-in-ie-11
// - https://stackoverflow.com/questions/18045551/how-do-i-download-a-file-from-external-url-to-variable

/*
Redirect user to a page
- Advantage: keeps get params and/or combine
- Note: It will not check if your url is broken. Use something like 'https://google.com' or 'https://google.com?tag=value&tag2=value2' as argument.
- Note2: you can force just your URL with second argument being true
*/
function lsw_redirect(url, raw_url) {
    if (raw_url) {
        window.location.href = url;
    }
    else if (url.indexOf("?") > 0) {
        window.location.href = (url + "&" + document.location.search.substring(1));
    }
    else {
        window.location.href = (url + document.location.search);
    }
}

/*
Get or set (updated) url params
*/
function lsw_manage_get(parameter, set)
{
    if (parameter == null) return;
    let get_http = document.location.search;
    if (get_http.indexOf('?') == 0) get_http = get_http.substring(1);

    let lst = get_http.split('&');
    let return_str = "";
    let got_one = false;


    for(let i = 0; i < lst.length; ++i) {
        if (lst[i].indexOf(parameter) === 0) {
            if (set === null) {
                lst.splice(i, 1);
            }
            else if (set !== undefined){
                lst[i] = parameter + "=" + set;
                return_str = set;
            }
            else {
                return_str = lst[i].substring(parameter.length + 1);
            }
            got_one = true;
            break;
        }
    }
    if (!got_one && set !== null && set !== undefined) {
        lst[lst.length] = parameter + "=" + set;
        return_str = set;
    }

    let str = "";
    for(let i = 0; i < lst.length; ++i) {
        str += lst[i] + "&";
    }

    window.history.replaceState(null, null, "?" + str.substring(0, str.length - 1));
    return decodeURI(return_str);
}


/*
Get current URL without arguments
- If you want to apply new get params, use this as base path
*/
function lsw_location_base() {
    let href = window.location.href;
    let search = href.lastIndexOf("#");
    if (search !== -1) href = href.substring(0, search);
    search = href.lastIndexOf("?");
    if (search !== -1) href = href.substring(0, search);
    search = href.lastIndexOf("/");
    if (search !== -1) href = href.substring(0, search);
    return href;
}

/*
Get current URL without arguments
- If you want to apply new get params, use this as base path
*/
function lsw_location()
{
    let href = window.location.href;
    let search = href.indexOf("://");
    search = href.indexOf("/", search < 0 ? 0 : search + 3);    
    if (search !== -1) href = href.substring(0, search);
    

    return (href.lastIndexOf("/") !== href.length - 1) ? (href + "/") : href;
}

/*
Replace all characters X to Y in string (return)
*/
function lsw_replace_all(text, what, to) {
    let i = text.indexOf(what);
    while(i >= 0 ){
      text = text.substring(0, i) + to + text.substring(i + what.length);
      i = text.indexOf(what);
    }
    return text;
  }

/*
Download a file from a URL async
- url: string
- callback: function(string)
- error_callback: function(int, XMLHttpRequest)
- headers_array_array: [[header, value], ...]
*/
function lsw_download(url, callback, error_callback, headers_array_array) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (typeof callback === 'function') callback(xhr.responseText);
            }
            else {
                if (typeof error_callback === 'function') error_callback(xhr.status, xhr);
            }
        }

    };
    xhr.open("GET", url, true);

    if (headers_array_array != null) {
        for (let i = 0; i < headers_array_array.length; ++i) {
            const pair = headers_array_array[i];
            xhr.setRequestHeader(pair[0], pair[1]);
        }
    }

    xhr.send();
}

/*
Insert data from an URL into a div (replace)
- div_id: string            | What id will have its innerHTML replaced with this content
- url: string               | The source of content
- callback: function(bool)  | Callback when success or failure (bool)
*/
function lsw_replace_download(div_id, url, callback)
{
    lsw_download(url, 
        function(data) {
            let element = document.getElementById(div_id);
            if (!element) {
                if (typeof callback === 'function') callback(false);
                return;
            }
            element.innerHTML = data;            
            if (typeof callback === 'function') callback(true);
        },
        function(err) {
            if (typeof callback === 'function') callback(false);
        }
    );
}


// ======================== COOKIE STUFF ======================== //
// References:
// - https://www.w3schools.com/js/js_cookies.asp
// - https://stackoverflow.com/questions/2144386/how-to-delete-a-cookie

/*
Set cookie:
- Good for temporary stuff
- IE11 mode of Edge may erase this every start
*/
function lsw_set_cookie(cookie_name, cookie_value, cookie_expire_ms) {
    if (!cookie_name) return false;

    if (cookie_expire_ms) {
        let d = new Date();
        d.setTime(d.getTime() + (cookie_expire_ms));
        document.cookie = cookie_name + "=" + encodeURIComponent(cookie_value) + ";expires="+ d.toUTCString() + ";path=/";
    }
    else {
        document.cookie = cookie_name + "=" + encodeURIComponent(cookie_value) + ";path=/";
    }

}

/*
Get cookie:
- Good for temporary stuff
- IE11 mode of Edge may erase this every start
*/
function lsw_get_cookie(cookie_name) {
    let name = cookie_name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

/*
Delete cookie:
- Good for temporary stuff
- IE11 mode of Edge may erase this every start
*/
function lsw_delete_cookie(cookie_name) {    
    document.cookie = cookie_name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
}

// ======================== DATA PARSING USEFUL ======================== //

/*
Put object or value as localStorage item automatically.
- Returns true on success.
*/
function lsw_storage_save_to(item_name, item_obj)
{
    try {
        const str_obj = JSON.stringify(item_obj);
        localStorage.setItem(item_name, str_obj);
        return true;
    }
    catch(err) {
        console.log("[STORAGE] Cannot store object typed '" + (typeof item_obj) + "' @ " + item_name);
        return false;
    }
}

/*
Get object or value from localStorage item. Doesn't work with raw data, only data saved with lsw_storage_save_to or JSON.stringify'ed.
- Returns object or null if fail
*/
function lsw_storage_get_from(item_name, defaults)
{
    try {
        const str_obj = localStorage.getItem(item_name);
        return (str_obj === null) ? (defaults ? defaults : null) : JSON.parse(str_obj);
    }
    catch(err) {
        console.log("[STORAGE] Cannot get back object typed '" + (typeof item_obj) + "' @ " + item_name);
        return (defaults ? defaults : null);
    }
}

/*
Create an array in this item name for array operations directly from it
- Returns true on success.
*/
function lsw_storage_make_array(item_name)
{
    return lsw_storage_save_to(item_name, []);
}

/*
Add item to array in this item name
- Returns true on success.
*/
function lsw_storage_append_array(item_name, item_obj)
{
    let working = lsw_storage_get_from(item_name);
    if (working === null) working = [];

    working[working.length] = item_obj;
    return lsw_storage_save_to(item_name, working);
}

/*
Get from an array a item (if exists)
- Returns item or null if failed (out of bounds or something)
*/
function lsw_storage_index_array(item_name, index)
{
    const working = lsw_storage_get_from(item_name);
    if (working === null) return null;
    if (index === null) return working[0];
    if (typeof index === 'number' && index < working.length) return working[index];
    return null;
}

/*
Take one from array (if exists)
- Returns item removed or null if none
*/
function lsw_storage_erase_from_array(item_name, index)
{
    if (typeof index !== number) return null;
    const working = lsw_storage_get_from(item_name);
    if (working === null || index >= working.length) return null;

    let obj = working.splice(index, 1);
    
    if (lsw_storage_save_to(item_name, working) === null) return null;
    
    return obj;
}

/*
Get index of element in parent element
- Returns 0..inf
*/
function lsw_get_index_of_child(node) {
    return Array.prototype.indexOf.call(node.parentNode.childNodes, node);
}

/*
Enumerates row/line of table
- Expects table built as: table -> tr[...] -> td[...]
- parameters: element, callback on click (useful)
- attributes saved on each element: lsw_line, lsw_row
*/
function lsw_enumerate_table(table, cb)
{
    if (!table) return false;

    for(let row = 0; row < table.children.length; ++row) {
        const cur_row = table.children[row];
        for(let line = 0; line < cur_row.children.length; ++line) {
            const obj = cur_row.children[line];
            const cline = line; // for func
            const crow = row; // for func
            if (typeof cb === 'function') obj.onclick = function(){ cb(obj, crow, cline); };
            obj.setAttribute("lsw_row", row);
            obj.setAttribute("lsw_line", line);
        }
    }
    return true;
}

/*
As it says, it toggles a class from list in element by ID
*/
function lsw_class_toggle(id, classname)
{    
    let elem = document.getElementById(id);
    elem.classList.toggle(classname);
}

/* 
Export to a file
- parameters: file data and file name (if null, "file.txt" will be used)
*/
function lsw_export_file(data, file_format)
{
    if (lsw_detect_ie()) {
        var fileData = [data];
        blobObject = new Blob(fileData);
        window.navigator.msSaveOrOpenBlob(blobObject, file_format ? file_format : 'file.txt');
    }
    else {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
        element.setAttribute('download', file_format ? file_format : 'file.txt');
    
        element.style.display = 'none';
        document.body.appendChild(element);
    
        element.click();
    
        document.body.removeChild(element);
    }
}

/*
Import a file and read its data
- parameters: callback with arg being the data
*/
function lsw_import_file(cb_data)
{
    let in_elem = document.createElement('input');
    in_elem.type = "file";
    in_elem.style.position = "absolute";
    in_elem.style.top = "-10000px";
    in_elem.style.left = "-10000px";

    in_elem.addEventListener("change", function(e){
        if (e.target.files.length <= 0) {
            console.log("[IMPORT] Failed: list is empty.");
            return;
        }
        if (typeof cb_data !== 'function') {
            return;
        }

        const fp = e.target.files[0];
        
        let reader = new FileReader();
        reader.onload = function(e) {
            cb_data(e.target.result);
        };
        reader.readAsText(fp);
    }, false);
    
    document.body.appendChild(in_elem);

    in_elem.click();

    document.body.removeChild(in_elem);
}

/*
PopUp
Make a fullscreen pop up on top of everything. It is self-served, I mean, no need for a object. It should work by itself
- params:
  - title*: The big h2 title
  - width: pop up size, percent [10..100]
  - height: pop up size, percent [10..100]
  - paragraphs: array of strings for <p>
  - buttons: array of strings to generate buttons <button>
  - inputs_defaults: array of strings for default inputs (can be empty for just an input)
  - callback: function with (event, index, extra); extra:
    - on button: {elem: element, root: top div parent}
    - on input: {elem: element, root: top div parent, key: key pressed down, value: value of input }
*/
var __lsw_current_popup = null; // used for further deletion of self if multiple are called

// on input do
function __lsw_i_popup_redir_in(event, idx){
    if (__lsw_current_popup == null) return;
    __lsw_current_popup._params.callback('text', idx, {
        elem: event.target,
        root: event.target.parentNode.parentNode.parentNode, // need double check on implementation
        value: event.target.value, // should work
        key: event.key // should work
    });
}
// on button do
function __lsw_i_popup_redir_btn(event, idx){
    if (__lsw_current_popup == null) return;
    __lsw_current_popup._params.callback('button', idx, {
        elem: event.target,
        root: event.target.parentNode.parentNode.parentNode 
    });
}
// function itself
function PopUp(params)
{
    if (params == null) return null;
    if (__lsw_current_popup != null && __lsw_current_popup["_root_elem"] != null) {
        try {
            const item = __lsw_current_popup._root_elem;
            item.parentNode.removeChild(item);
            __lsw_current_popup = null;
        } catch(err) {
            console.log("[POPUP] Warn on element removal (may be because it was removed before recall): " + err);
        }
    }

    let obj = {
        _params: params,
        _root_elem: null
    };

    let width = 70;
    let height = 40;
    
    if (params["width"] != null && params.width >= 10 && params.width <= 100) width = params.width;
    if (params["height"] != null && params.height >= 10 && params.height <= 100) height = params.height;

    /* ROOT */
    const elem = document.createElement('div');
    elem.style.width = '100%';
    elem.style.height = '100%';
    elem.style.backgroundColor = 'rgba(0,0,0,0.3)';
    elem.style.zIndex = 99999
    elem.style.position = 'fixed';
    elem.style.top = '0';
    elem.style.left = '0';
    elem.style.overflow = 'hidden';
    elem.style.transition = 'all 1s';

    const over_elem = document.createElement('div');
    over_elem.style.minWidth = width + '%';
    over_elem.style.minHeight = height + '%';
    over_elem.style.width = 'auto';
    over_elem.style.height = 'auto';
    over_elem.style.position = 'absolute';
    over_elem.style.backgroundColor = 'hsla(0, 0%, 100%, 0.95)';
    over_elem.style.border = '1px solid black';
    over_elem.style.borderRadius = '30px';
    over_elem.style.top = '50%';
    over_elem.style.left = '50%';
    over_elem.style.padding = '3em';
    over_elem.style.transform = 'translate(-50%,-50%)';
    over_elem.style.boxShadow = '7px 7px 34px hsla(0, 0%, 5%, 0.8), inset 8px 5px 3px hsl(0, 0%, 100%), inset -3px -5px 3px hsla(0, 0%, 40%, 0.6)';

    let htm = " \
<style> \
.__lbtn { \
    transition: 0.5s ease; \
    padding: 0.4em 1.2em; \
    margin: 0.1em; \
    border-radius: 7px; \
    color: #fff; \
    font-style: normal; \
    font-size: 16px; \
    letter-spacing: 0.01rem; \
    border: 0; \
    -webkit-font-smoothing: antialiased; \
    background-color: #2a86b8; \
    flex-grow: 1; \
    box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.3); \
} \
 \
.__lbtn:hover { \
    transform: scale(1.02) translate(-1px, -1px); \
    box-shadow: 3px 3px 2px 1px rgba(0, 0, 0, 0.5), inset 0 0 500px 1px rgba(255, 255, 255, 0.3); \
    transition: all 0.1s; \
} \
 \
.__lbtn:active{ \
    transform: translate(1px, 1px); \
    box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.1); \
    transition: all 0.2s; \
} \
.__lh2{ \
    color: rgb(0, 0, 0); \
    font-size: 2.5em; \
    text-align: center; \
    padding: 0 0.1em 1.2em 0.1em; \
    margin: 0 auto; \
    display: flex; \
    justify-content: center; \
    text-decoration: underline; \
} \
.__lp { \
    color: rgb(0, 0, 0); \
    margin: 0.3em auto; \
    padding: 0 0.1em 0.45em 0.1em; \
    text-align: justify; \
    justify-content: initial; \
    text-align-last: left; \
    display: block; \
} \
.__linput { \
padding: 0.3em; \
border-radius: 7px; \
} \
.__ldiv3, .__ldiv1 { \
    align-items: center; \
    display: flex; \
    flex-wrap: wrap; \
    margin: 0 !important; \
    padding: 0 !important; \
    grid-template-columns: 1fr 1fr; \
    gap: 0.5rem; \
} \
.__ldiv3 > * { \
    flex-grow: 1; \
    width: calc(33% - 2 * 1rem);\
}\
.__ldiv1 > * { \
    flex-grow: 1; \
    width: calc(100% - 2 * 1rem);\
}\
</style> \
\
<h2 class=\"__lh2\">" + params.title + "</h2>";

    for(let i = 0; params.paragraphs != null && i < params.paragraphs.length; ++i) {
        htm += "<p class=\"__lp\">" + params.paragraphs[i] + "</p>";
    }

    // NEED INPUT THINGYS HERE
    if (params.inputs_defaults != null) {        
        htm += "<div class=\"__ldiv1\">";

        for(let i = 0; i < params.inputs_defaults.length; ++i) {
            const str = params.inputs_defaults[i];
            htm += "<input class=\"__linput\" type=\"text\"" + (str.length ? (" value=\"" + str + "\"") : "") + " onkeyup=\"__lsw_i_popup_redir_in(event, " + i + ")\">";
        }

        htm += "</div>";
    }

    if (params.buttons != null) {
        htm += "<div class=\"__ldiv3\" style=\" \
width: 90%; \
position: absolute; \
bottom: 10%; \
left: 5%; \
\">";

        for (let i = 0; params.buttons != null && i < params.buttons.length; ++i)
        {
            htm += "<button class=\"__lbtn\" onclick=\"__lsw_i_popup_redir_btn(event, " + i + ")\">" + params.buttons[i] + "</button>\n"
        }

        htm += "</div>";
    }

    over_elem.innerHTML = htm;

    elem.appendChild(over_elem);

    // WORKING ON IT

    document.body.insertBefore(elem, document.body.firstChild);

    obj._root_elem = elem;
    __lsw_current_popup = obj;

    return obj;
}

// Table array only available on tools_objectified because as 'class'-like it is much easier to manage