import express from 'express';
import helmet from 'helmet';
import csurf from 'csurf';
import http from 'http';
import rateLimit from 'express-rate-limit';
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
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const setUpExpress = async () => {
    await connectDB(); // Wait for MongoDB connection

    const app = express();
    app.use(helmet());
    app.use(cookieParser()); // Use cookie-parser middleware
    app.use(express.json()); // Parse JSON requests

    const csrfProtection = csurf({ cookie: true }); // CSRF middleware
    app.use(csrfProtection); // Use CSRF protection middleware

    // Set the CSRF token in a cookie
    app.use((req, res, next) => {
        res.cookie('XSRF-TOKEN', req.csrfToken());
        next();
    });

    setupMiddleware(app);

    app.use(passport.initialize());
    app.use((req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (user) req.user = user;
            next();
        })(req, res, next);
    });

    app.use(router);

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests, please try again later.',
    });

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static('client/build'));
        app.get('*', limiter, (req, res) => {
            res.sendFile(
                path.resolve(__dirname, 'client', 'build', 'index.html'),
            );
        });
    }

    const port = process.env.PORT || 5000;
    const server = http.createServer(app);
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

setupServer(true);
