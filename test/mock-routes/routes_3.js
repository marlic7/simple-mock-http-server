module.exports = (app, io) => {
    app.get('/r-io', (req, res) => {
        res.send('routes from io');
    });

    io.on('connection', (socket) => {
        console.log('a user connected to socket.io id:', socket.id);
    });

    console.log("route: routes_3 loaded");
};
