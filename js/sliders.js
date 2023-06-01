var __lsw_mouse = {
    last_mx: 0,
    last_my: 0,
    grabbed_element: null
}

addEventListener("mousemove", __lsw_mousemove);
addEventListener("mouseup", __lsw_mouseup);

function __lsw_mousemove(ev) {
    const dx = ev.clientX - __lsw_mouse.last_mx;
    const dy = ev.clientY - __lsw_mouse.last_my;
    __lsw_mouse.last_mx = ev.clientX;
    __lsw_mouse.last_my = ev.clientY;

    if (__lsw_mouse.grabbed_element === null) return;
    
    const curr_x = (dx + Number(__lsw_mouse.grabbed_element.getAttribute('__lsw-pos_x')));
    const curr_y = (dy + Number(__lsw_mouse.grabbed_element.getAttribute('__lsw-pos_y')));

    __lsw_mouse.grabbed_element.setAttribute('__lsw-pos_x', curr_x);
    __lsw_mouse.grabbed_element.setAttribute('__lsw-pos_y', curr_y);
    
    const max_x = __lsw_mouse.grabbed_element.getAttribute('__lsw-max_x');
    const max_y = __lsw_mouse.grabbed_element.getAttribute('__lsw-max_y');

    __lsw_mouse.grabbed_element.style.left = (curr_x > max_x ? max_x : (curr_x < 0 ? 0 : curr_x)) + "px";
    __lsw_mouse.grabbed_element.style.top  = (curr_y > max_y ? max_y : (curr_y < 0 ? 0 : curr_y)) + "px";
}
function __lsw_mouseup() {
    if (__lsw_mouse.grabbed_element !== null) {
        // update to real position. 

        __lsw_mouse.grabbed_element.setAttribute(
            '__lsw-pos_x', 
            __lsw_mouse.grabbed_element.style.left.substring(
                    0,
                    __lsw_mouse.grabbed_element.style.left.length - 2
                )
            );
            __lsw_mouse.grabbed_element.setAttribute(
                '__lsw-pos_y', 
                __lsw_mouse.grabbed_element.style.top.substring(
                        0,
                        __lsw_mouse.grabbed_element.style.top.length - 2
                    )
                );

        __lsw_mouse.grabbed_element.onmousemove();
        __lsw_mouse.grabbed_element = null;
    }
}

function lsw_make_slider_of(div_id, max_x, max_y, callback, keep_select_text_enabled)
{
    let element = document.getElementById(div_id);
    if (element === null) return false;

    element.setAttribute('__lsw-pos_x', '0');
    element.setAttribute('__lsw-pos_y', '0');
    element.setAttribute('__lsw-max_x', max_x);
    element.setAttribute('__lsw-max_y', max_y);

    element.style.position = "absolute";

    element.onmousedown = function(e) {
        __lsw_mouse.grabbed_element = this;
    };

    element.onmousemove = function() {
        if (this !== __lsw_mouse.grabbed_element || typeof callback !== 'function') return;

        const pdx = Number(this.getAttribute('__lsw-pos_x')) * 100.0 / Number(this.getAttribute('__lsw-max_x'));
        const pdy = Number(this.getAttribute('__lsw-pos_y')) * 100.0 / Number(this.getAttribute('__lsw-max_y'));

        callback((pdx > 100.0 ? 100.0 : (pdx < 0.0 ? 0.0 : pdx)), (pdy > 100.0 ? 100.0 : (pdy < 0.0 ? 0.0 : pdy)));
    };
    
    if ((keep_select_text_enabled != true) && (' ' + element.parentElement.className + ' ').indexOf(' lsw-__no_mouse_select ') == -1) { //(!element.classList.contains('lsw-__no_mouse_select')) {
        element.parentElement.className += " lsw-__no_mouse_select";
    }
}

function lsw_slider_get_horizontal_perc(div_id) {

    let element = document.getElementById(div_id);
    if (element === null) return -1;
    
    const pdx = Number(element.getAttribute('__lsw-pos_x')) * 100.0 / Number(element.getAttribute('__lsw-max_x'));

    return (pdx > 100.0 ? 100.0 : (pdx < 0.0 ? 0.0 : pdx));
}

function lsw_slider_get_vertical_perc(div_id) {

    let element = document.getElementById(div_id);
    if (element === null) return -1;
    
    const pdy = Number(element.getAttribute('__lsw-pos_y')) * 100.0 / Number(element.getAttribute('__lsw-max_y'));

    return (pdy > 100.0 ? 100.0 : (pdy < 0.0 ? 0.0 : pdy));
}

function lsw_slider_position_like_perc(div_id, w, h)
{
    if (!w && !h) return false;

    let element = document.getElementById(div_id);
    if (element === null) return false;

    if (w) {
        w = Number(w);
        if (w > 100.0) w = 100.0;
        if (w < 0.0) w = 0.0;

        const max_w = element.getAttribute('__lsw-max_x');
        element.setAttribute('__lsw-pos_x', w * 0.01 * max_w);
        
        element.style.left = (w * 0.01 * max_w) + "px";
    }

    if (h) {
        h = Number(h);
        if (h > 100.0) h = 100.0;
        if (h < 0.0) h = 0.0;

        const max_h = element.getAttribute('__lsw-max_y');
        element.setAttribute('__lsw-pos_y', h * 0.01 * max_h);
        
        element.style.top = (h * 0.01 * max_h) + "px";
    }
}
