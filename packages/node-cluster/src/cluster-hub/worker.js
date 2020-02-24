const http = require("http");
const hub = require("clusterhub");

const MAX_REQUEST = 100;

// Workers can share any TCP connection
// In this case it is an HTTP server
const server = http.createServer();

server.on("request", (req, res) => {
  const realIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // increment the IP integer value in key-value db
  realIP && hub.incr(realIP);

  // first get the IP integer value asynchronously, then decide whether to limit
  hub.get(realIP, count => {
    if (count > MAX_REQUEST) {
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
});

server.listen(8000);

console.log(`Worker ${process.pid} started`);
