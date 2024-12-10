#!/usr/bin/env node

import app from '../app.mjs';

import debug from 'debug';
import http from 'http';

// Normalize port
const normalizePort = (val) => {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val; // Named pipe
    if (port >= 0) return port; // Port number
    return false;
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);

server.on('listening', () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
    console.log(`Server running at http://localhost:${port}/`);
});

server.listen(port);
