const http = require("http");
const hub = require("clusterhub");

const ipRecord = {};
const MAX_REQUEST = 3;

// Workers can share any TCP connection
// In this case it is an HTTP server
const server = http.createServer();

server.on("request", (req, res) => {
  const realIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  realIP && syncRequest(realIP);

  if (realIP && ipRecord[realIP] > MAX_REQUEST) {
    console.warn(
      `[${process.pid}] IP: ${realIP} exceeded the maximum request quantity!`
    );
    res.writeHeader(400);
    res.end("Too many requests!");
    return;
  }

  res.writeHeader(200);
  res.end("hello world\n");
});

server.listen(8000);

// listen SYNC_REQUEST on hub
hub.on("SYNC_REQUEST", ip => {
  ipRecord[ip] = (ipRecord[ip] || 0) + 1;
});

// increase ip request number and notify other workers by hub.emitRemote()
function syncRequest(ip) {
  ipRecord[ip] = (ipRecord[ip] || 0) + 1;
  hub.emitRemote("SYNC_REQUEST", ip);
}

console.log(`Worker ${process.pid} started`);
