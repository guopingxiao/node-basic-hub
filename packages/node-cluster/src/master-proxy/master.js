const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    worker.on("message", message => {
      // proxy workers IPC
      if (message.action === "SYNC_REQUEST") {
        sendToOtherWorkers(worker.id, message);
      }
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    // accidental exit, add new worker
    if (!worker.exitedAfterDisconnect) {
      cluster.fork();
    }
  });

  function sendToOtherWorkers(workerSender, message) {
    for (const id in cluster.workers) {
      if (+id !== workerSender) {
        // 发送给其他workers
        cluster.workers[id].send(message);
      }
    }
  }
} else {
  require("./worker");
}
