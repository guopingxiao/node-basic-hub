const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  // 是否主进程
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // accidental exit, add new worker
    if (!worker.exitedAfterDisconnect) {
      // 非master主动关闭，会重新fork()
      cluster.fork();
    }
  });
} else {
  // worker进程
  require("./worker");
}
