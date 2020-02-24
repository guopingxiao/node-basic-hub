const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
// 注意引入 clusterhub
require("clusterhub");

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // accidental exit, add new worker
    if (!worker.exitedAfterDisconnect) {
      cluster.fork();
    }
  });
} else {
  require("./worker2");
}
