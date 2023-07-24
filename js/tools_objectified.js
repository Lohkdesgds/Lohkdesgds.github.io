// Common tools used everywhere, objectified.
// All functions should be IE11 compatible.
// LSW V1.0 JS

/*
Objected lsw_download:
- Set_url(string): set URL string
- Set_callbacks(function, function): set functions for callback on success and error
- Send(): send GET
*/
function LSWDownload(_url, cbk, cbe) {
    let obj = {
        _xhr: new XMLHttpRequest(),
        _url: null,
        _cb: null,
        _cbe: null,

        SetURL: null,
        SetCallbacks: null,
        Send: null
    };

    obj.SetURL = function (url) {
        if (typeof url === 'string') this._url = url;
    };
    obj.SetCallbacks = function(cb, cb_err) {
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

    if (_url !== null) obj.SetURL(_url);
    if (cbk !== null || cbe !== null) obj.SetCallbacks(cbk, cbe);

    return obj;
}

/*
Objected Cookie:
Create and manage a cookie like an object
*/
function LSWCookie()
{
    let obj = {
        _id: null,

        SetName: null,
        SetValue: null,
        GetValue: null,
        Delete: null
    };

    obj.SetName = function(id) {
        if (id !== null && typeof id === 'string') {
            this._id = id;
            return true;
        }
        return false;
    };
    obj.SetValue = function(value, expire) {
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
    obj.GetValue = function() {
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

/*
Objected LocalStorage:
Create and manage a smart (self organized) localstorage like an object
*/
function LocalStorageCustom(key, as_array)
{
    if (key == null) return null;

    if (as_array === true) {        
        let obj = {
            _id: key,
            _cache: null,
            _is_array: true,
            _SetArrayCache: null,

            GetArray: null,
            SetArray: null,
            GetIndex: null,
            SetIndex: null,
            Append: null,
            Erase: null,
            Length: null,
            PopFront: null,
            PopBack: null,
            Delete: null
        };

        obj._SetArrayCache = function() {
            const obj = {
                type: 'array',
                value: JSON.stringify(this._cache)
            }
            this._cache = obj.value;
            localStorage.setItem(this._id, JSON.stringify(obj));
        }
        obj.GetArray = function(use_cache) {
            try {
                if (use_cache === true && typeof this._cache !== null) return this._cache;
                
                const val = JSON.parse(localStorage.getItem(this._id));

                if (typeof val === 'object' && 
                    val.type === 'array' &&
                    val.value != null)
                {
                    return (this._cache = JSON.parse(val.value));
                }
            }
            catch(err) {
                console.log("[tools_objectified](LocalStorageCustom) Error: " + err);
            }
            return null;
        }
        obj.SetArray = function(what) {
            this._cache = what;
            this._SetArrayCache();
        }
        obj.GetIndex = function(index) {
            if (typeof index !== 'number') return null;
            if (use_cache === true && typeof this._cache !== null) return this._cache[index];

            const arr = this.GetArray();
            if (arr !== null) return arr[index];
            return null;

        }
        obj.SetIndex = function(index, value) {
            if (this._cache !== null) {
                this._cache[index] = value;
                this._SetArrayCache();
            }
            else {
                this.GetArray();
                if (this._cache == null) this._cache = [value];
                else this._cache[index] = value;
                this._SetArrayCache();
            }
        }
        obj.Append = function(value) {
            const index = this._cache ? this._cache.length : 0;
            this.SetIndex(index, value);
        }
        obj.Erase = function(index) {
            if (this._cache === null) this.GetArray();
            if (index >= this.Length()) return false;
            
            this._cache = this._cache.splice(index, 1);
            this._SetArrayCache();      

            return true;
        }
        obj.Length = function(index) {
            if (this._cache === null) this.GetArray();
            if (typeof this._cache == null) return 0;
            return this._cache.length;
        }
        obj.PopFront = function() {
            const max = this.Length();
            if (max === 0) return null;
            const orig = this.GetIndex(0);
            this.Erase(0);
            return orig;
        }
        obj.PopBack = function() {
            const max = this.Length();
            if (max === 0) return null;
            const orig = this.GetIndex(max-1);
            this.Erase(max-1);
            return orig;
        }
        obj.Delete = function() {
            localStorage.removeItem(_id);
            this._cache = null;
        }

        return obj;
    }
    else {
        let obj = {
            _id: key,
            _cache: null,
            _is_array: false,

            Get: null,
            Set: null,
            Delete: null
        };

        obj.Get = function(use_cache) {
            if (use_cache === true && typeof this._cache !== null) return this._cache;
            try {
                const val = JSON.parse(localStorage.getItem(this._id));

                if (typeof val === 'object' && 
                    val.type === 'item' &&
                    val.value != null)
                {
                    return (this._cache = JSON.parse(val.value));
                }
            }
            catch(err) {
                console.log("[tools_objectified](LocalStorageCustom) Error: " + err);
            }

            return null;
        }
        obj.Set = function(what) {
            const obj = {
                type: 'item',
                value: JSON.stringify(what)
            }

            this._cache = obj.value;
            localStorage.setItem(this._id, JSON.stringify(obj));

        };
        obj.Delete = function() {
            localStorage.removeItem(this._id);
            this._cache = null;
        }

        return obj;
    }
}

/*
TableObject
Work on a table like an object easily with this
- id MUST BE A TABLE
*/
function TableObject(id) {
    let obj = {
        _elem: document.getElementById(id),

        GetRow: null, // get whole row. horizontal
        GetRowContent: null, // get whole row as array of string. horizontal
        GetItem: null, // get with row and line
        GetItemContent: null, // get with row and line a string
        SetRowRaw: null, // set whole row with raw html
        SetRowContent: null, // set whole row with content array
        SetItemRaw: null, // set element with raw html
        SetItemContent: null, // set element content
        AppendRowRaw: null, // append new row in table with raw html
        AppendRowContent: null, // append new row in table with content array
        DeleteRow: null, // delete a row. If first, next one will be translated to th.
        SwapRows: null, // changes two rows
        SortRows: null, // sort ascending or descending
        ToArrayOfArray: null, // make table an array of array of string
        FromArrayOfArray: null, // build table from array of array of string
        GetSize: null, // number of rows
        FindAtIndex: null // find on index of row that content. Get index
    };

    obj.GetRow = function(row) {
        if (row >= this._elem.children.length) return null;
        return this._elem.children[row];
    };
    obj.GetRowContent = function(row) {
        if (row >= this._elem.children.length) return null;
        
        let arr = [];
        for (let i = 0; i < this._elem.children[row].children.length; ++i) {
            arr[i] = this._elem.children[row].children[i].textContent;
        }
        return arr;
    };
    obj.GetItem = function(row, line) {
        if (row >= this._elem.children.length) return null;
        if (line >= this._elem.children[row].children.length) return null;
        return this._elem.children[row].children[line];
    };
    obj.GetItemContent = function(row, line) {
        if (row >= this._elem.children.length) return null;
        if (line >= this._elem.children[row].children.length) return null;
        return this._elem.children[row].children[line].textContent;
    };
    obj.SetRowRaw = function(row, data) {
        if (row >= this._elem.children.length) return false;
        this._elem.children[row].innerHTML = data;
        return true;
    };
    obj.SetRowContent = function(row, data_array) {
        if (row >= this._elem.children.length) return false;
        if (this._elem.children[row].children.length !== data_array.length) return false;
        for(let i = 0; i < data_array.length; ++i) {
            if (this._elem.children[row].children[i].textContent != data_array[i]) this._elem.children[row].children[i].textContent = data_array[i];
        }
        return true;
    };
    obj.SetItemRaw = function(row, line, data) {
        if (row >= this._elem.children.length) return false;
        if (line >= this._elem.children[row].children.length) return false;
        this._elem.children[row].children[line].innerHTML = data;
        return true;
    };
    obj.SetItemContent = function(row, line, data) {
        if (row >= this._elem.children.length) return false;
        if (line >= this._elem.children[row].children.length) return false;
        if (this._elem.children[row].children[line].textContent != data) this._elem.children[row].children[line].textContent = data;
        return true;
    };
    obj.AppendRowRaw = function(data) {
        const new_elem = document.createElement('tr');
        new_elem.innerHTML = data;
        this._elem.appendChild(new_elem);
        return true;
    }
    obj.AppendRowContent = function(data) {
        const new_elem = document.createElement('tr');
        
        for(let i = 0; i < data.length; ++i) {
            const new_item = (this._elem.children.length === 0) ? (document.createElement('th')) : (document.createElement('td'));
            new_item.textContent = data[i];
            new_elem.appendChild(new_item);
        }
        this._elem.appendChild(new_elem);
        return true;
    }
    obj.DeleteRow = function(row) {
        if (row >= this._elem.children.length) return false;
        this._elem.removeChild(this._elem.children[row]);
        if (row === 0 && this._elem.children.length > 0) {
            for(let i = 0; i < this._elem.children[0].children.length; ++i) {
                let new_elem = document.createElement('th');
                new_elem.innerHTML = this._elem.children[0].children[i].innerHTML;
                this._elem.children[0].replaceChild(new_elem, this._elem.children[0].children[i]);
            }
        }
        return true;
    };
    obj.SwapRows = function(fst, snd) {
        if (fst == snd) return false;
        if (fst >= this._elem.children.length || snd >= this._elem.children.length) return false;

        const ref_fst = this._elem.children[fst];
        const ref_snd = this._elem.children[snd];

        const cpy = ref_snd.innerHTML;
        ref_snd.innerHTML = ref_fst.innerHTML;
        ref_fst.innerHTML = cpy;
        
        if (fst === 0 || snd === 0) {
            const non_zero = fst === 0 ? snd : fst;

            for(let i = 0; i < this._elem.children[0].children.length; ++i) {
                let new_elem = document.createElement('th');
                new_elem.innerHTML = this._elem.children[0].children[i].innerHTML;
                this._elem.children[0].replaceChild(new_elem, this._elem.children[0].children[i]);
            }
            for(let i = 0; i < this._elem.children[non_zero].children.length; ++i) {
                let new_elem = document.createElement('td');
                new_elem.innerHTML = this._elem.children[non_zero].children[i].innerHTML;
                this._elem.children[non_zero].replaceChild(new_elem, this._elem.children[non_zero].children[i]);
            }
        }
    };
    obj.SortRows = function(descending, from, to) {
        if (typeof from !== 'number' || from < 0) from = 0;
        if (from >= this._elem.children.length || to <= from) return true;
        if (typeof to !== 'number' || to > this._elem.children.length || to < 0) to = this._elem.children.length;

        for(let i = from; i < to; ++i) {
            for(let j = i + 1; j < to; ++j) {
                const fst = this._elem.children[i];
                const snd = this._elem.children[j];

                if (descending === false && fst.children[0].textContent > snd.children[0].textContent) {
                    this.SwapRows(i, j);
                }
                else if (fst.children[0].textContent < snd.children[0].textContent) {
                    this.SwapRows(i, j);
                }
            }
        }
    };
    obj.ToArrayOfArray = function() {
        let arr = [];
        
        for(let i = 0; i < this._elem.children.length; ++i) {
            arr[i] = [];
            for(let j = 0; j < this._elem.children[i].children.length; ++j) {
                arr[i][j] = this._elem.children[i].children[j].textContent;
            }
        }

        return arr;
    };
    obj.FromArrayOfArray = function (arr) {
        for(let i = 0; i < arr.length; ++i) {
            if (this._elem.children.length <= i) this.AppendRowContent(arr[i]);
            else this.SetRowContent(i, arr[i]);
        }
        while(this._elem.children.length > arr.length) this.DeleteRow(this._elem.children.length - 1);
    };
    obj.GetSize = function() {
        return this._elem.children.length;
    };
    obj.FindAtIndex = function(index, what) {
        for(let i = 0; i < this._elem.children.length; ++i) {
            if (this._elem.children[i].children.length < index) continue;
            if (this._elem.children[i].children[index].textContent == what) return i;
        }
        return -1;
    };

    return obj;
}