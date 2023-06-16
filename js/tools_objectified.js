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

        obj._SetArrayCache = function(what) {
            const obj = {
                type: 'array',
                value: JSON.stringify(this._cache)
            }
            this._cache = obj.value;
            localStorage.setItem(this._id, JSON.stringify(obj));
        }
        obj.GetArray = function(use_cache) {
            if (use_cache === true && typeof this._cache !== null) return this._cache;
            
            const val = JSON.parse(localStorage.getItem(this._id));

            if (typeof val === 'object' && 
                typeof val.type === 'string' && val.type === 'array' &&
                typeof val.value !== 'undefined')
            {
                return (this._cache = JSON.parse(val.value));
            }

            return null;
        }
        obj.SetArray = function(what) {
            this._cache = obj.value;
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
                    typeof val.type === 'string' && val.type === 'item' &&
                    typeof val.value !== 'undefined')
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
TableArray
Make tables easier to handle with this
- id MUST BE A TABLE
*/
function TableArray(id)
{
    if (id == null) return null;

    let obj = {
        // keep a look on ExportDATA and ImportDATA if anything changes!
        _elem: document.getElementById(id),
        _table: {
            head_class: '',
            head_item_class: '',
            data_class: '',
            data_item_class: '',
            head: [], // header of items
            data: []  // array of items
        },

        _updateClassHTML: null,
        _updateHeaderHTML: null,
        _updateItemHTML: null,
        _removeItemHTML: null,

        SetClasses: null,
        SetHeader: null,
        Append: null,
        Set: null,
        SetLast: null,
        Get: null,
        GetLast: null,
        SetInner: null,
        GetInner: null,
        Erase: null,
        Build: null,
        ExportDATA: null,
        ImportDATA: null,
        Sort: null
    };

    if (obj._elem == null) return null;

    obj._updateClassHTML = function() {
        if (this._elem.childElementCount === 0) return;

        // header
        this._elem.children[0].className = this._table.head_class;
        for(let j = 0; j < this._elem.children[0].childElementCount; ++j) 
            this._elem.children[0].children[j].className = this._table.head_item_class;

        // elems
        for(let i = 1; i < this._elem.childElementCount; ++i) {
            let inn = this._elem.children[i];
            inn.className = this._table.data_class;
            for(let j = 0; j < inn.childElementCount; ++j) inn.children[j].className = this._table.data_item_class;
        }
    }
    obj._updateHeaderHTML = function() {
        if (this._elem.childElementCount === 0){ // new
            this.Build();
            return;
        }

        let res = "";
        const cl = this._table.head_class ? (" class=\"" + this._table.head_class + "\"") : "";
        for(let i = 0; i < this._table.head.length; ++i) res += "<th" + cl + ">" + this._table.head[i] + "</th>";
        
        this._elem.children[0].innerHTML = res;
        for(let j = 0; j < this._elem.children[0].childElementCount; ++j) 
            if (this._elem.children[0].children[j].className !== this._table.head_item_class)
                this._elem.children[0].children[j].className = this._table.head_item_class;

        //this._updateClassHTML();
    };
    obj._updateItemHTML = function(index) {
        if (this._elem.childElementCount === 0){ // new
            this.Build();
            return true;
        }

        if (index >= this._table.data.length) return -1;

        const elem_index = index + 1;
        if (elem_index > this._elem.childElementCount) return -2; // or new one next to existing one or existing one, no out of range for no unexpected things please.
                

        if (elem_index === this._elem.childElementCount) {            
            let res = "";
            const cl = this._table.data_item_class ? (" class=\"" + this._table.data_item_class + "\"") : "";
            for(let i = 0; i < this._table.data[index].length; ++i) 
                res += "<td" + cl + ">" + this._table.data[index][i] + "</td>";

            let new_elem = document.createElement('tr');
            new_elem.innerHTML = res;
            new_elem.className = this._table.data_class;
            //for(let j = 0; j < new_elem.childElementCount; ++j) new_elem.children[j].className = this._table.data_item_class;
            this._elem.appendChild(new_elem);
        }
        else {
            let inn = this._elem.children[elem_index];
            //this._elem.children[elem_index].innerHTML = res;
            for(let j = 0; j < inn.childElementCount; ++j) {
                /*if (j >= inn.children.length) { // test later? // update: no need.
                    let new_elem = document.createElement('td');
                    if (this._table.data_item_class) new_elem.className = this._table.data_item_class;
                    new_elem.textContent = this._table.data[index][j];
                    inn.appendChild(new_elem);
                }
                else {*/
                if (inn.children[j].textContent != this._table.data[index][j]) inn.children[j].textContent = this._table.data[index][j];
                if (inn.children[j].className != this._table.data_item_class) inn.children[j].className = this._table.data_item_class;
                //}
            }
        }

        return true;
    };
    obj._removeItemHTML = function(index) {
        if (index >= this._elem.childElementCount) return true;
        this._elem.removeChild(this._elem.children[index]);
    };


    obj.SetClasses = function (head_cl, head_item_cl, data_cl, data_item_cl) {
        this._table.data_class = data_cl;
        this._table.head_item_class = head_item_cl;
        this._table.head_class = head_cl;
        this._table.data_item_class = data_item_cl;

        this._updateClassHTML();
    }
    obj.SetHeader = function(array) {
        if (array == null || array.length === 0) return false;
        this._table.head = array;
        this._updateHeaderHTML();
    };
    obj.Append = function(array) {
        if (array == null || array.length === 0) return false;
        const index = this._table.data.length;

        this._table.data[index] = array;
        this._updateItemHTML(index);
        return true;
    };
    obj.Set = function(index, array) {
        if (array == null || array.length === 0 || index >= this._table.data.length) return false;
        this._table.data[index] = array;
        this._updateItemHTML(index);
        return true;
    };
    obj.SetLast = function(array) {
        let index = 0;

        for(let i = 1; i < this._table.data.length; ++i) {
            if (this._table.data[i][0] > this._table.data[index][0]) index = i;
        }

        return this.Set(index, array);
    };
    obj.Get = function(index) {
        if (index >= this._table.data.length) return null;
        return this._table.data[index];
    };
    obj.GetLast = function() {
        let index = 0;

        for(let i = 1; i < this._table.data.length; ++i) {
            if (this._table.data[i][0] > this._table.data[index][0]) index = i;
        }

        return this.Get(index);
    };
    obj.SetInner = function(index, inner_index, value) {
        if (array == null || array.length === 0 || index >= this._table.data.length) return false;
        this._table.data[index][inner_index] = value;
        this._updateItemHTML(index);
        return true;
    };
    obj.GetInner = function(index, inner_index) {
        if (index >= this._table.data.length) return null;
        return this._table.data[index][inner_index];
    };
    obj.Erase = function(index) {
        if (index >= this._table.data.length) return false;        
        this._table.data = this._table.data.splice(index, 1);
        this._removeItemHTML(index);
        return true;
    };
    obj.Build = function () {
        while(this._elem.childElementCount > 0) this._elem.removeChild(this._elem.firstChild);

        let res = "";
        for(let i = 0; i < this._table.head.length; ++i) res += "<th>" + this._table.head[i] + "</th>";
        
        let new_elem = document.createElement('tr');
        new_elem.innerHTML = res;
        this._elem.appendChild(new_elem);

        for(let i = 0; i < this._table.data.length; ++i) this._updateItemHTML(i);
        
        this._updateClassHTML();
        return true;
    };
    obj.ExportDATA = function() {
        const new_obj = {
            elem: this._elem.id,
            table: this._table
        };
        return new_obj;
    };
    obj.ImportDATA = function(new_obj) {
        this._elem = document.getElementById(new_obj.elem);
        this._table = new_obj.table;
        return true;
    };
    obj.Sort = function(descending) {
        this._table.data.sort(function(a,b){return (a[0] < b[0]) ? 1 : -1;}); // less to more

        if (descending === true) 
            this._table.data.reverse();
    };

    while(obj._elem.childElementCount > 0) obj._elem.removeChild(obj._elem.firstChild);

    return obj;
}