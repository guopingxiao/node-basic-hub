const http = require("http");

// record the number of IP requests
const ipRecord = {};
const MAX_REQUEST = 3;

// Workers can share any TCP connection， In this case it is an HTTP server
let server = http.createServer();

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

// increase ip request number when notified by other workers
process.on("message", message => {
  if (message.action === "SYNC_REQUEST") {
    ipRecord[message.ip] = (ipRecord[message.ip] || 0) + 1;
  }
});

// increase ip request number and notify other workers
function syncRequest(ip) {
  ipRecord[ip] = (ipRecord[ip] || 0) + 1;
  process.send({
    action: "SYNC_REQUEST",
    ip
  });
}

console.log(`Worker ${process.pid} started`);
