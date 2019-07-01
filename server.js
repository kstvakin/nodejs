const http = require('http');
const app = require('./app');
const cron = require('./api/Helper/cron');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port);