const socket = io('/');

const videoGrid = document.getElementById('video-grid');

const mypeer = new Peer(undefined, {
    host: '/',
    port: '3001',
});

const myVideo = document.createElement('video');
myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    mypeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');

        call.on('stream', userVideoStream => {
            addVideoStream(video, stream);
        });
    });

    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });
});

socket.on('user-disconnected', userId => {
    console.log(userId);

    if(peers[userId]) peers[userId].close();
});

mypeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

socket.on("user-connected", userId => {
    console.log("User connected : " + userId);
});

function connectToNewUser(userId, stream) {
    const call = mypeer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove();
    });
}

function addVideoStream(video, stream) {
    video.srcObject = stream;
    video.addEventListener("Loadedmetadata", () => {
        video.play();
    });
    videoGrid.append(video);
}