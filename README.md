# Simple HTTP server with posibility to mock API (http and socket.io) and automatic reload routes on change route file

## Install

```bash
npm install -g simple-mock-http-server
```

## Usage

```bash
simple-mock-http-server -o -p 8080 -r mock-routes
```

## Route file (route files is the same as in Express lib see: http://expressjs.com/en/guide/routing.html)

./mock-routes/routes_1.js
```js
module.exports = (app) => {
    app.get('/users', (req, res) => {
        res.json({
            success: true,
            data: ['user1', 'user2', 'user3']
        });
    });
};
```

## Help

```bash
simple-mock-http-server -h
```
