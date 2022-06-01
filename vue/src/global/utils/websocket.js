import { getRandom } from "@/global/utils"
/*
   DouyuEx WebSocket UnLogin
    By: 小淳
*/
class Ex_WebSocket_UnLogin {
    // 调用方法：
    // 连接：let a = new Ex_WebSocket_UnLogin("房间号", 消息回调函数);
    // 关闭连接: a.WebSocket_Close(); a = null; 记得null掉变量再重新连接
    // 消息回调函数建议用箭头函数，示例：(msg) => {// TODO}
    constructor(rid, callback, callback_error) {
        if ("WebSocket" in window) {
            this.timer = 0;
            this.roomid = rid;
            this.ws = new WebSocket("wss://danmuproxy.douyu.com:850" + String(getRandom(2,5))); // 负载均衡 8502~8504都可以用
            this.ws.onopen = () => {
                this.ws.send(WebSocket_Packet("type@=loginreq/roomid@=" + rid));
                this.ws.send(WebSocket_Packet("type@=joingroup/rid@=" + rid + "/gid@=-9999/"));
                this.timer = setInterval(() => {
                    this.ws.send(WebSocket_Packet("type@=mrkl/"));
                }, 40000)
                // console.log("WebSocket已连接");
            };
            this.ws.onmessage = (e) => { 
                let reader = new FileReader();
                reader.onload = () => {
                    let arr = String(reader.result).split("\0"); // 分包
                    reader = null;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].length > 12) {
                            // 过滤第一条和心跳包
                            callback(arr[i]);
                        }
                    }
                };
                reader.readAsText(e.data);
            };
            this.ws.onclose = () => { 
                callback_error();
            };
        }
    }
    close() {
        clearInterval(this.timer);
        this.ws.close();
    }
}

/*
   DouyuEx WebSocket
    By: 小淳
    此处为一些公共函数
*/

function WebSocket_Packet(str) {
    const MSG_TYPE = 689;
    let bytesArr = stringToByte(str);   
    let buffer = new Uint8Array(bytesArr.length + 4 + 4 + 2 + 1 + 1 + 1);
    let p_content = new Uint8Array(bytesArr.length); // 消息内容
    for (let i = 0; i < p_content.length; i++) {
        p_content[i] = bytesArr[i];
    }
    let p_length = new Uint32Array([bytesArr.length + 4 + 2 + 1 + 1 + 1]); // 消息长度
    let p_type = new Uint32Array([MSG_TYPE]); // 消息类型

    buffer.set(new Uint8Array(p_length.buffer), 0);
    buffer.set(new Uint8Array(p_length.buffer), 4);
    buffer.set(new Uint8Array(p_type.buffer), 8);
    buffer.set(p_content, 12);

    return buffer;
}

function stringToByte(str) {  
    let bytes = new Array();  
    let len, c;  
    len = str.length;  
    for(let i = 0; i < len; i++) {  
        c = String(str).charCodeAt(i);  
        if(c >= 0x010000 && c <= 0x10FFFF) {  
            bytes.push(((c >> 18) & 0x07) | 0xF0);  
            bytes.push(((c >> 12) & 0x3F) | 0x80);  
            bytes.push(((c >> 6) & 0x3F) | 0x80);  
            bytes.push((c & 0x3F) | 0x80);  
        } else if(c >= 0x000800 && c <= 0x00FFFF) {  
            bytes.push(((c >> 12) & 0x0F) | 0xE0);  
            bytes.push(((c >> 6) & 0x3F) | 0x80);  
            bytes.push((c & 0x3F) | 0x80);  
        } else if(c >= 0x000080 && c <= 0x0007FF) {  
            bytes.push(((c >> 6) & 0x1F) | 0xC0);  
            bytes.push((c & 0x3F) | 0x80);  
        } else {  
            bytes.push(c & 0xFF);  
        }  
    }  
    return bytes;  
}

function byteToString(arr) {
    if(typeof arr === 'string') {
        return arr;
    }
    let str = '',
        _arr = arr;
    for(let i = 0; i < _arr.length; i++) {
        let one = _arr[i].toString(2),
            v = one.match(/^1+?(?=0)/);
        if(v && one.length == 8) {
            let bytesLength = v[0].length;
            let store = _arr[i].toString(2).slice(7 - bytesLength);
            for(let st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2);
            }
            str += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1;
        } else {
            str += String.fromCharCode(_arr[i]);
        }
    }
return str;
}


function hex2bin(e) {
    if ("string" === typeof e && e.length % 8 === 0) {
        for (let r = [], t = e.length, o = 0; o < t;) r.push(e.substr(o, 2)), o += 2;
        for (let n = [], i = r.length, s = 0; s < i;) n.push(parseInt(r.slice(s, s + 4).reverse().join(""), 16)), s += 4;
        return n
    }
    return null
}

function hex(e) {
    if (Array.isArray(e)) {
        let r = "0123456789abcdef".split("");
        return e.map(function (e) {
            for (let t = "", o = 0; o < 4; o++) t += r[e >> 8 * o + 4 & 15] + r[e >> 8 * o & 15];
            return t
        }).join("")
    }
    return ""
}

export {
    Ex_WebSocket_UnLogin
}