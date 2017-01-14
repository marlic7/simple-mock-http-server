"use strict";

const
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser  = require('body-parser'),
    fs = require('fs'),
    watch = require('watch'),
    reload = require('require-reload')(require),
    remRoute = require('express-remove-route');

let logger = {
    info:    () => {},
    error:   () => {},
    debug:   () => {},
    request: () => {}
};

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use((req, res, next) => {
    res.on('finish', () => {
        let error = !!([200,304].indexOf(res.statusCode) === -1);
        logger.request(req, res, error);
    });
    next();
});

function setStaticRoot(dir) {
    app.use(express.static(dir));
}

function setLogger(newLogger) {
    logger = newLogger;
}

function startServer(port, mockRoutesPath, cb) {
    let isRoutesLoaded = false;
    try {
        loadRoutesSync(mockRoutesPath);
        isRoutesLoaded = true;
    } catch(err) {
        logger.error('Mising directory with mock route files: '.yellow + mockRoutesPath.red);
        logger.debug({ errStack: err.stack }, err.message);
    }

    let server = app.listen(port, () => {
        if (cb) {
            cb();
            // return; // don't remove
        } else {
            logger.info(['Start listening on port:'.yellow, (port + '').cyan].join(' '));
        }

        if(!isRoutesLoaded) {
            return;
        }

        // watch for mock-routes changes and reload routes
        watch.createMonitor(mockRoutesPath, (monitor) => {
            monitor.on("created", (f) => {
                logger.info('new file created: ' + f);
                reloadRoutes(mockRoutesPath);
            });
            monitor.on("changed", (f) => {
                logger.info('file changed: ' + f);
                reloadRoutes(mockRoutesPath);
            });
            monitor.on("removed", (f) => {
                logger.info('file removed: ' + f);
                reloadRoutes(mockRoutesPath);
            });
        });
    });

    io.listen(server);
}

function reloadRoutes(mockRoutesPath) {
    let routes = app._router.stack;

    let routesToDelete = [];

    routes.forEach(route => {
        if(route && route.route && route.route.path) {
            routesToDelete.push(route.route.path);
        }
    });

    routesToDelete.forEach(v => {
        logger.info('Removing route: '.yellow,  v.red);
        remRoute(app, v);
    });

    loadRoutesSync(mockRoutesPath);
}

function loadRoutesSync(mockRoutesPath) {
    let stat = fs.statSync(mockRoutesPath);

    if(!stat.isDirectory()) {
        throw new Error('Mock routes path is not a directory: ' + mockRoutesPath);
    }

    let dirContent = fs.readdirSync(mockRoutesPath);

    dirContent.forEach(file => {
        if(file.match(/.js$/)) {
            let filePath = mockRoutesPath + '/' + file;
            let route = reload(filePath);
            route(app, io);
            logger.info('Files from mock path loaded: '.yellow, filePath.cyan);
        }
    });
}

exports.setStaticRoot = setStaticRoot;
exports.setLogger     = setLogger;
exports.startServer   = startServer;
