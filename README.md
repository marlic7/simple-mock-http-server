# Simple HTTP server with posibility to mock API (http and socket.io) and automatic reload routes on change route file

## Install

```bash
# globally
npm install -g simple-mock-http-server
# or in project as dev dependencies
npm install --save-dev simple-mock-http-server
```

## Usage

From hand

```bash
simple-mock-http-server -o -p 8080 -r mock-routes
```

With NPM scripts

```path
package.json
```

```json
...
"scripts": {
    "start": "./node_modules/.bin/simple-mock-http-server -o -p 8080 -r mock-routes",
}
...
```

```bash
npm run start
# or shorter (becouse of lifecycle script)
npm start
```


## Route files

Route files spec are the same as in Express lib see:
http://expressjs.com/en/guide/routing.html)

```path
./mock-routes/routes_1.js
```

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
