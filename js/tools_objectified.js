// Common tools used everywhere, objectified.
// All functions should be IE11 compatible.
// LSW V1.0 JS

/*
Objected lsw_download:
- Set_url(string): set URL string
- Set_callbacks(function, function): set functions for callback on success and error
- Send(): send GET
*/
function LSWDownload(url, cb, cbe) {
    let obj = {
        _xhr: new XMLHttpRequest(),
        _url: null,
        _cb: null,
        _cbe: null,

        Set_url: null,
        Set_callbacks: null,
        Send: null
    };

    obj.Set_url = function (url) {
        if (typeof url === 'string') this._url = url;
    };
    obj.Set_callbacks = function(cb, cb_err) {
        if (typeof cb === 'function') this._cb = cb;
        if (typeof cb_err === 'function') this._cbe = cb_err;
    };
    obj.Send = function() {
        this._xhr.onreadystatechange = function() {
            if (this._xhr.readyState === 4) {
                if (this._xhr.status === 200) {
                    if (this._cb !== null) this._cb(this._xhr.responseText);
                }
                else {
                    if (this._cbe !== null) this._cbe(this._xhr.status, this._xhr);
                }
            }
        };

        this._xhr.open("GET", this._url, true);
        this._xhr.send();
    };

    if (url !== null) obj.Set_url(url);
    if (cb !== null || cbe !== null) obj.Set_callbacks(cb, cbe);

    return obj;
}

/*
Objected Cookie:
Create and manage a cookie like an object
*/
function LSWCookie(name)
{
    let obj = {
        _id: null,

        Set_name: null,
        Set_value: null,
        Get_value: null,
        Delete: null
    };

    obj.Set_name = function(id) {
        if (id !== null && typeof id === 'string') {
            this._id = id;
            return true;
        }
        return false;
    };
    obj.Set_value = function(value, expire) {
        if (this._id === null) return false;
        if (typeof value !== 'string') return false;

        if (expire) {
            let d = new Date();
            d.setTime(d.getTime() + (expire));
            document.cookie = this._id + "=" + encodeURIComponent(cookie_value) + ";expires="+ d.toUTCString() + ";path=/";
        }
        else {
            document.cookie = this._id + "=" + encodeURIComponent(cookie_value) + ";path=/";
        }
        return true;
    };
    obj.Get_value = function() {
        if (this._id === null) return null;

        let name = this._id + "=";
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
    };
    obj.Delete = function() {
        if (this._id === null) return null;        
        document.cookie = this._id + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
    };

    return obj;
}