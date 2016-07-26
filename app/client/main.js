// Allow instant data transfer from signalingChannelFactory
// See CustomEvent API
var eventEmitter = document.createElement('event-emitter');

window.addEventListener("load", function(){
    var received = document.getElementById('received');
    var peers = document.getElementById('peers');
    var callee = document.getElementById('callee');
    var identity = document.getElementById('identity');

    // Adds an item in the list of accessible peers
    function addPeer (id) {
        if(id%2) return
        var newPeer = document.createElement('li');
        
        newPeer.id = id;
        newPeer.innerText = 'Peer n°' + id/2;
        
        newPeer.onclick = function () {
            startCommunication(+newPeer.id)
            callee.innerText = 'Peer n°' + newPeer.id/2
        }
        
        peers.appendChild(newPeer);
    }

    function printMessage (message) {
        var newText = document.createTextNode(message);
        received.appendChild(newText);
    }

    // Each user will initiate two sessions: a caller and a callee
    // The order matters: callees' ids will be even numbers
    initCaller(printMessage, eventEmitter);
    initCallee(printMessage, eventEmitter);

    // Below events are emitted from signalingChannelFactory
    // They are only emitted when the latter is instantiated as a callee

    eventEmitter.addEventListener('id', function (e) {
        console.log(e.detail, 'id fetched');
        window.id = e.detail;
        identity.innerText = 'You are peer n°' + e.detail/2;
    })

    eventEmitter.addEventListener('connection', function (e) {
        console.log('connection', e.detail);
        addPeer(e.detail);
    })

    // signalingChannelFactory sends us ALL peers (both callers and callees)
    // Current user won't be displayed
    // Again, callees' ids are always even
    eventEmitter.addEventListener('peers', function (e) {
        e.detail
        .filter(function (peer) {
            return !peer%2 || +peer !== window.id
        })
        .forEach(addPeer)
    })

    eventEmitter.addEventListener('disconnection', function (e) {
        console.log('disconnection', e.detail)
        var lostPeer = document.getElementById(e.detail);
        lostPeer.parentNode.removeChild(lostPeer);
    })
    
    document.getElementById("send").onclick= function(){
        var message = document.getElementById('message').value;
        channel.send(message);
    };
    
}, false);