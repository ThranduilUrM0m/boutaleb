import os from 'os';
import cluster from 'cluster';

let workers = [];

export const setupWorkerProcesses = () => {
    let numCores = os.cpus().length;
    console.log(`Master cluster setting up ${numCores} workers`);

    for (let i = 0; i < numCores; i++) {
        workers.push(cluster.fork());
        workers[i].on('message', (message) => console.log(message));
    }

    cluster.on('online', (worker) =>
        console.log(`Worker ${worker.process.pid} is listening`),
    );
    cluster.on('exit', (worker, code, signal) => {
        console.log(
            `Worker ${worker.process.pid} died with code: ${code}, signal: ${signal}. Restarting...`,
        );
        let newWorker = cluster.fork();
        workers.push(newWorker);
        newWorker.on('message', (message) => console.log(message));
    });
};
