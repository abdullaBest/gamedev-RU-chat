"use strict"
/*
    copyright 2017 Hamzin Abdulla (abdulla_best@mail.ru)
*/

console.log('Process versions: ',process.versions);

let WebSocketServer = require('ws').Server;                // связь
let express         = require('express');
let SERVER          = null; // сервер
let WS              = null; // веб сокет сервер

console.log('запускаем сервер обмена данными.');

let CHAT = [];
let USERS = [];

function prepare_server(){
    SERVER = express();
    SERVER.use(express.static(__dirname + '/public'));
    let app = SERVER.listen(80);
    // WS
    WS = new WebSocketServer({
        port                : 3000,
        perMessageDeflate   : false,
        server              : app
    });
    WS.on('connection', function(ws) { 
        USERS.push(ws);  
        ws.onmessage = user_message; 
    });
    
    
}
prepare_server();


function _send(socket,message){
    if (socket===null){return;}
    if (socket.readyState===1){
        try{
            socket.send(message);
        }catch(e){
            //console.log(message);
        }
    }else{
    }
}

function _send_all(message){
    let i = USERS.length;
    while(i--){
        let socket = USERS[i];
        if (socket===null){
            USERS.splice(i,1);
            continue;
        }
        if (socket.readyState===1){
            try{
                socket.send(message);
            }catch(e){
                USERS.splice(i,1);
                //console.log(message);
            }
        }else{
            USERS.splice(i,1);
        }
    }
}


function user_message(m){
    let a = '';
    try{
        a = JSON.parse(m.data);
    }catch(e){
        return;
    }
    if (!Array.isArray(a)){return;}    
    if (a.length<3){return;}
    let n = parseInt(a[0]);
    if (isNaN(n)){return;}
    let nick = new String(a[1]).toString();
    let msg  = new String(a[2]).toString();
    nick = nick.substring(0,20);
    msg  = msg.substring(0,100);
    let s;
    switch(n){
        case 0:
                _send(this,JSON.stringify([0,CHAT]));
                break;
        case 1:
                s = JSON.stringify( [1,nick,msg] );
                CHAT.push(s);
                if (CHAT.length>100){ CHAT.shift(); }
                _send_all(s);
                break;
    }
}

