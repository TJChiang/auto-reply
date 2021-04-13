import app from './app';

const listenPort = process.env.LINE_BOT_SERVICE_PORT;

const server = app.listen(listenPort, () => {
    console.log(`Server started on ${listenPort}`);
});

export default server;