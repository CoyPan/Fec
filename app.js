/**
 * @file 简单提供一个server
 */

const Tinny = require('tinny');

const server = new Tinny({
    staticPath: '/dist', 
    rootPath: '/', 
    port: 8099
});

server.get('/', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('hello world');
});

server.start();