var  connectedPeers = {};
var id = 0
function onMessage(ws, message){
    var type = message.type;
    switch (type) {
        case "ICECandidate":
            onICECandidate(message.ICECandidate, message.destination, ws.id);
            break;
        case "offer":
            onOffer(message.offer, message.destination, ws.id);
            break;
        case "answer":
            onAnswer(message.answer, message.destination, ws.id);
            break;
        case "id":
            onId(ws);
            break;
        case "init":
            onInit(ws);
            break;
        default:
            throw new Error("invalid message type");
    }
}

function onId(ws) {
    ws.id = ++id;

    console.log('on id', id)
    ws.send(JSON.stringify({
        type: 'id',
        id: id
    }))

    ws.on('close', function () {
        console.log('close', ws.id);
        delete connectedPeers[ws.id];

        Object.keys(connectedPeers).forEach(function (peer) {
            connectedPeers[peer].send(JSON.stringify({
                type: 'disconnection',
                id: ws.id
            }))
        })
    })
}

function onInit(ws){
    console.log("init from peer:", ws.id);
    
    ws.send(JSON.stringify({
        type: 'peers',
        peers: Object.keys(connectedPeers)
    }))

    Object.keys(connectedPeers).forEach(function (peer) {
        connectedPeers[peer].send(JSON.stringify({
            type: 'connection',
            id: ws.id
        }))
    })

    connectedPeers[ws.id] = ws;
}

function onOffer(offer, destination, source){
    console.log("offer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type:'offer',
        offer:offer,
        source:source,
    }));
}

function onAnswer(answer, destination, source){
    console.log("answer from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'answer',
        answer: answer,
        source: source,
    }));
}

function onICECandidate(ICECandidate, destination, source){
    console.log("ICECandidate from peer:", source, "to peer", destination);
    connectedPeers[destination].send(JSON.stringify({
        type: 'ICECandidate',
        ICECandidate: ICECandidate,
        source: source,
    }));
}

module.exports = onMessage;

//exporting for unit tests only
module.exports._connectedPeers = connectedPeers;