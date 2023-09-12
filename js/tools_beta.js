

/*
Transform ArrayBuffer to string
*/
function lsw_ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

/*
Transform string to ArrayBuffer
*/
function lsw_str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

/*
Compress data
*/
function lsw_compress(data, cb){
    // Convert JSON to Stream
    const blobb = new Blob([data], {type: 'application/json'});
    const stream = blobb.stream();
    // gzip stream
    const compressedReadableStream = stream.pipeThrough(new CompressionStream("gzip"));
    // create Response
    const compressedResponse = new Response(compressedReadableStream);

    compressedResponse.blob().then(function(blob){        
        blob.arrayBuffer().then(function(buffer){
            if(typeof cb === 'function') cb(lsw_ab2str(buffer));
        });
    });
}

/*
Decompress data
*/
function lsw_decompress(data, cb) {
    const blobb = new Blob([lsw_str2ab(data)], {type: "application/json"});
    const stream = blobb.stream();
    const compressedReadableStream = stream.pipeThrough(new DecompressionStream("gzip"));
    const resp = new Response(compressedReadableStream);
    resp.blob().then(function(blob){
        blob.text().then(function(res){
            if(typeof cb === 'function') cb(res);
        });
    });
}

/*
Check JSON valid
*/
function lsw_check_JSON(text) {
    if (typeof text !== "string") {
        return false;
    }
    try {
        JSON.parse(text);
        return true;
    } catch (error) {
        return false;
    }
}