import express from 'express';
import cors from 'cors';
import { healthcheckRouter } from './routes/healthcheck.routes.js';
import cookieParser from 'cookie-parser';
import { userRouter } from './routes/user.routes.js';
import { commentRouter } from './routes/comment.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { playlistRouter } from './routes/playlist.routes.js';
import { subscriptionRouter } from './routes/subscription.routes.js';
import { tweetRouter } from './routes/tweet.routes.js';
import { videoRouter } from './routes/video.routes.js';
import { likeRouter } from './routes/like.routes.js';
// import { errorHandler } from './middlewares/error.middlewares.js';

const app = express();

// Log to check if app.js is loading
console.log('Initializing app and routes...');

//common middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ limit: '16kb', extended: true }));

app.use(express.static('public'));

app.use(cookieParser())

// Log to confirm healthcheck route is loaded
app.use('/api/v1', commentRouter)
app.use('/api/v1', dashboardRouter)
app.use('/api/v1', healthcheckRouter);
app.use('/api/v1', likeRouter)
app.use('/api/v1', playlistRouter)
app.use('/api/v1', subscriptionRouter)
app.use('/api/v1', tweetRouter)
app.use('/api/v1', userRouter);
app.use('/api/v1', videoRouter)

// app.use(errorHandler)

console.log('Healthcheck route loaded!');

export { app };
