import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import path from 'path';
import cluster from 'cluster';
import passport from 'passport';
import dotenv from 'dotenv';
import * as models from './models/index.js';
import { connectDB, db } from './config/mongo.js';
import { setupMiddleware } from './config/middleware.js';
import { setupWorkerProcesses } from './config/cluster.js';
import './config/passport.js';
import { socketHandler } from './sockets.js';
import router from './routes/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setUpExpress = async () => {
    // Wait for MongoDB connection
    await connectDB(); // Wait for MongoDB to fully connect before starting the server

    // Define express app
    const app = express();

    // Setup middleware
    setupMiddleware(app);

    // Passport initialization
    app.use(passport.initialize());

    // Middleware for attaching user to request
    app.use((req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (user) {
                req.user = user;
            }
            next();
        })(req, res, next);
    });

    // Setup routes
    app.use(router);

    // Serve React production build
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('client/build'));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
        });
    }

    // Start server
    const port = process.env.PORT || 5000;
    const server = http.createServer(app);

    // Setup Socket.io with MongoDB connection
    const io = new Server(server);
    socketHandler(io, db);

    server.listen(port, () => console.log(`Server running on port ${port}`));
};

const setupServer = (isClusterRequired) => {
    if (isClusterRequired && cluster.isPrimary) {
        setupWorkerProcesses();
    } else {
        setUpExpress(); // Call the setupExpress function
    }
};

// Start the server
setupServer(true);