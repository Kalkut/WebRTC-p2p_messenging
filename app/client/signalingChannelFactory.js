function SignalingChannel(eventEmmiter, callee){

    var _ws;
    var self = this;

    function connectToTracker(url){
        _ws = new WebSocket(url);
        _ws.onopen = _onConnectionEstablished;
        _ws.onclose = _onClose;
        _ws.onmessage = _onMessage;
        _ws.onerror = _onError;
    }

    function _onConnectionEstablished(){
        _sendMessage('id');
    }

    function _onClose(){
        console.error("connection closed");
    }

    function _onError(err){
        console.error("error:", err);
    }


    function _onMessage(evt){
        var objMessage = JSON.parse(evt.data);
        switch (objMessage.type) {
            case "ICECandidate":
                self.onICECandidate(objMessage.ICECandidate, objMessage.source);
                break;
            case "offer":
                self.onOffer(objMessage.offer, objMessage.source);
                break;
            case "answer":
                self.onAnswer(objMessage.answer, objMessage.source);
                break;
            case "id":
                onId(objMessage.id);
                break;
            case "connection":
                onConnection(objMessage.id);
                break;
            case "disconnection":
                onDisconnection(objMessage.id);
                break;
            case "peers":
                onPeers(objMessage.peers);
                break;
            default:
                throw new Error("invalid message type");
        }
    }

    function _sendMessage(type, data, destination){
        var message = {};
        message.type = type;
        message[type] = data;
        message.destination = destination;
        _ws.send(JSON.stringify(message));
    }

    function sendICECandidate(ICECandidate, destination){
        _sendMessage("ICECandidate", ICECandidate, destination);
    }

    function sendOffer(offer, destination){
        _sendMessage("offer", offer, destination);
    }

    function sendAnswer(answer, destination){
        _sendMessage("answer", answer, destination);
    }

    function onId (id) {
        _sendMessage('init');
        if(callee) eventEmmiter.dispatchEvent(new CustomEvent('id', { detail: id }));
    }

    function onConnection (id) {
        if(callee) eventEmmiter.dispatchEvent(new CustomEvent('connection', { detail: id }));
    }

    function onDisconnection (id) {
        if(callee) eventEmmiter.dispatchEvent(new CustomEvent('disconnection', { detail: id }));
    }

    function onPeers (peers) {
        console.log('on peers', peers)
        if(callee) eventEmmiter.dispatchEvent(new CustomEvent('peers', { detail: peers }));
    }

    this.connectToTracker = connectToTracker;
    this.sendICECandidate = sendICECandidate;
    this.sendOffer = sendOffer;
    this.sendAnswer = sendAnswer;

    //default handler, should be overriden 
    this.onOffer = function(offer, source){
        console.log("offer from peer:", source, ':', offer);
    };

    //default handler, should be overriden 
    this.onAnswer = function(answer, source){
        console.log("answer from peer:", source, ':', answer);
    };

    //default handler, should be overriden 
    this.onICECandidate = function(ICECandidate, source){
        console.log("ICECandidate from peer:", source, ':', ICECandidate);
    };
}

window.createSignalingChannel = function(url, eventEmmiter, callee){
    var signalingChannel = new SignalingChannel(eventEmmiter, callee);
    signalingChannel.connectToTracker(url);
    return signalingChannel;
};
