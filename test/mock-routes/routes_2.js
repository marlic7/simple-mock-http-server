module.exports = (app) => {
    app.get('/r2', (req, res) => {
        res.send('routes_2 works');
    });
};
