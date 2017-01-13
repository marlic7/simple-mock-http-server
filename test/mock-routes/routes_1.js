module.exports = (app) => {
    app.get('/r1', (req, res) => {
        res.send('routes_1 works');
    });
};
