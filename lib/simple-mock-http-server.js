"use strict";

const express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    bodyParser  = require('body-parser'),
    fs = require('fs'),
    watch = require('watch'),
    reload = require('require-reload')(require),
    remRoute = require('express-remove-route');

let logger = {
    info:    function () {},
    request: function () {}
};

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(function (req, res, next) {
    res.on('finish', function() {
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
    loadRoutesSync(mockRoutesPath);

    let server = app.listen(port, function () {
        if (cb) {
            cb();
        } else {
            logger.info(['Start listening on port:'.yellow, (port + '').cyan].join(' '));
        }

        // watch for mock-routes changes and reload routes
        watch.createMonitor(mockRoutesPath, function (monitor) {
            monitor.on("created", function (f) {
                logger.info('new file created: ' + f);
                reloadRoutes(mockRoutesPath);
            });
            monitor.on("changed", function (f) {
                logger.info('file changed: ' + f);
                reloadRoutes(mockRoutesPath);
            });
            monitor.on("removed", function (f) {
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
    try {
        let stat = fs.statSync(mockRoutesPath);
        try {
            if(!stat.isDirectory()) {
                throw new Error('Mock routes path is not a directory: ' + mockRoutesPath);
            }
            let dirContent = fs.readdirSync(mockRoutesPath);
            dirContent.forEach(function(file) {
                if(file.match(/.js$/)) {
                    let filePath = mockRoutesPath + '/' + file;
                    let route = reload(filePath);
                    route(app, io);
                    logger.info('Files from mock path loaded: '.yellow, filePath.cyan);
                }
            });
        } catch (e) {
            logger.info(e.message.red);
            logger.info(e.stack);
        }
    } catch (e) {
        logger.error('Mising directory with mock route files: '.yellow + mockRoutesPath.red);
    }
}

exports.setStaticRoot = setStaticRoot;
exports.setLogger     = setLogger;
exports.startServer   = startServer;
