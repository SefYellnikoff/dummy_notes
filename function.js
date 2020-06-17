$(document).ready(function () {
    var socket = io();

    socket.on('hello', function (myname) {
        $('#info').text("Your name is: " + myname);
    });
    socket.on('message', function (from, text) {
        $('#messages').append('<div><b>' + from + ':</b> ' + text + '</div>');
    });
    $('#message').keypress(function (e) {
        if ((e.keyCode || e.which) == 13) { //INVIO
            socket.emit('message', $('#message').val());
            $('#message').val('');
        }
    });
});