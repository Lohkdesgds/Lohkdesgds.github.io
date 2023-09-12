var __lsw_mouse_objects = [];
    
    addEventListener("mousemove", __lsw_mousemove);
    addEventListener("mouseup", __lsw_mouseup);

    function __lsw_mousemove(ev)
    {
        for(let i = 0; i < __lsw_mouse_objects.length; ++i)
        {
            const obj = __lsw_mouse_objects[i];
            const rect = obj.getBoundingClientRect();
            const x = ev.clientX - rect.left; // x position within the element.
            const y = ev.clientY - rect.top;  // y position within the element.
            const dx = (x * 1.0 / obj.clientWidth);
            const dy = (y * 1.0 / obj.clientHeight);
            const delete_soon = x > (rect.right - rect.left) || y > (rect.bottom - rect.top);

            const work = {
                on: (!delete_soon),
                x: (x > (rect.right - rect.left) ? (rect.right - rect.left) : x),
                y: (y >  (rect.bottom - rect.top) ?  (rect.bottom - rect.top) : y),
                px: (dx > 1.0 ? 1.0 : (dx < 0.0 ? 0.0 : dx)),
                py: (dy > 1.0 ? 1.0 : (dy < 0.0 ? 0.0 : dy))
            };

            obj.setAttribute("lsw_mouse_on", (delete_soon ? "false": "true"));
            obj.setAttribute("lsw_mouse_x",  "" + work.x); //"" + x > (rect.right - rect.left) ? (rect.right - rect.left) : x);
            obj.setAttribute("lsw_mouse_y",  "" + work.y); //"" + y >  (rect.bottom - rect.top) ?  (rect.bottom - rect.top) : y);
            obj.setAttribute("lsw_mouse_px", "" + work.px);//(dx > 1.0 ? 1.0 : (dx < 0.0 ? 0.0 : dx)));
            obj.setAttribute("lsw_mouse_py", "" + work.py);//(dy > 1.0 ? 1.0 : (dy < 0.0 ? 0.0 : dy)));

            const fcn = eval(obj.getAttribute("onslider"));
            if (typeof fcn === 'function') fcn(obj, work); // self call
            if (delete_soon) {
                __lsw_mouse_objects.splice(i--, 1);
            }
        }
    }
    function __lsw_mouseup(ev)
    {
        for(let i = 0; i < __lsw_mouse_objects.length; ++i)
        {
            const obj = __lsw_mouse_objects[i];
            const rect = obj.getBoundingClientRect();
            const x = ev.clientX - rect.left; // x position within the element.
            const y = ev.clientY - rect.top;  // y position within the element.
            const dx = (x * 1.0 / obj.clientWidth);
            const dy = (y * 1.0 / obj.clientHeight);
            
            const work = {
                on: false,
                x: (x > (rect.right - rect.left) ? (rect.right - rect.left) : x),
                y: (y >  (rect.bottom - rect.top) ?  (rect.bottom - rect.top) : y),
                px: (dx > 1.0 ? 1.0 : (dx < 0.0 ? 0.0 : dx)),
                py: (dy > 1.0 ? 1.0 : (dy < 0.0 ? 0.0 : dy))
            };

            obj.setAttribute("lsw_mouse_on", "false");
             obj.setAttribute("lsw_mouse_x",  "" + work.x); //+ x);
             obj.setAttribute("lsw_mouse_y",  "" + work.y); //+ y);
             obj.setAttribute("lsw_mouse_px", "" + work.px);// + (dx > 1.0 ? 1.0 : (dx < 0.0 ? 0.0 : dx)));
             obj.setAttribute("lsw_mouse_py", "" + work.py);// + (dy > 1.0 ? 1.0 : (dy < 0.0 ? 0.0 : dy)));

             try {
                const fcn = eval(obj.getAttribute("onslider"));
                if (typeof fcn === 'function') fcn(obj, work); // self call
            }
            catch(err) {
                console.log("[SLIDER] Error: " + err);
            }
        }
        __lsw_mouse_objects = [];
    }
    // auto apply
    {
        const onload = window.onload;
        window.onload = function(){
            const lst = document.querySelectorAll("[sliderenable='true']");
            for(let i = 0; i < lst.length; ++i) {
                const self = lst[i];
                self.onmousemove = function(ev) {
                    if (__lsw_mouse_objects.indexOf(self) < 0 && ev.buttons > 0) {
                        __lsw_mouse_objects[__lsw_mouse_objects.length] = self;
                    }
                }
            }
            if (typeof onload === 'function') onload();
        }
    }