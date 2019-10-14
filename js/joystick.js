// Create a socket instance
var socket = new WebSocket("ws://" + location.host + ":8000");

// var socket = new WebSocket("ws://127.0.0.1:8080");
var connected = false;

socket.onopen = function (event) {
    setStatus('Connected');
    setControl(true);
    sendMessage({message: 'Init: New Device'});
};

socket.onmessage = function (event) {
    console.log('[message received]:', event.data);
    setMessage(event.data);
};

socket.onclose = function (event) {
    setControl(false);
    if (event.wasClean) {
        console.log('[close] Connection closed cleanly, reason:' + event.reason);
        setStatus('Closed: clean');
    } else {
        console.log('[close] Connection died');
        setStatus('Closed: dirty');
    }
};

socket.onerror = function (error) {
    setControl(false);
    console.log('[error]:', error.message);
    setStatus('Error');
};

function setStatus(status) {
    document.getElementById('status').innerText = status;
}

function setMessage(message) {
    document.getElementById('message').innerText = message;
}

function sendMessage(data) {
    if (connected) {
        if (typeof (data) === 'object')
            socket.send(JSON.stringify(data));
        else socket.send(data);
    }
}

function setControl(ctrl) {
    connected = ctrl;
}

function degreesToRadians(degree) {
    if (degree > 90) degree = degree - 90;
    else degree = degree + 270;
    return degree * (Math.PI / 180);
}

var options = {
    zone: document.getElementById('zone_joystick'),
    mode: 'static',
    size: 128,
    position: {right: '96px', top: '50%'},
    color: 'black',
    multitouch: false,
    restJoystick: true,     // reset when finder lifted
    restOpacity: 0.8
};

var joystick = nipplejs.create(options);

var print = true;

joystick.on('start', function () {
    console.log('Game - start');
}).on('end', function () {
    var controlCmd = {angle: 0, speed: 0};
    console.log(controlCmd);
    sendMessage(controlCmd);
    console.log('Game - end');
}).on('move', function (evt, data) {
    if (print && data.direction) {
        print = false;
        /*var speed = data.direction.y === 'up' ? data.force : -data.force;
        if (speed > 2.1) speed = 2.1;
        else if (speed < -2.1) speed = -2.1;
        speed = Math.round(speed * 10000) / 10000;
        var angle = Math.round(degreesToRadians(data.angle.degree) * 10000) / 10000;*/
        // nipplejs returns direction is screen coordiantes
        var direction = data.angle.degree - 90;
        if (direction > 180) direction = -(450 - data.angle.degree);
        // convert angles to radians and scale linear and angular speed
		
        var lin = Math.cos(direction / 57.29) * data.force;
        var ang = Math.sin(direction / 57.29) * data.force;

        if (data.direction.y === 'down') ang = -ang;
        var controlCmd = {angle: ang, speed: lin};
        console.log(controlCmd);
        sendMessage(controlCmd);
        setTimeout(function () {
            print = true;
        }, 100);
    }
});

function getvideourl(){
	
	return "http://" + location.host + ":8080/stream?topic=/camera/rgb/image_raw&type=ros_compressed"

}
document.getElementById("bgCamera").src = getvideourl();