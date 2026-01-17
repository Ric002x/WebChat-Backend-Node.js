import express, { type Request, type Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/index.ts';
import http from "http"
import { initIO } from './lib/socket.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuring Api Server
const app = express()
const PORT = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, 'static')))


// Configure socket
const server = http.createServer(app)
const io = initIO(server);


io.on("connection", (socket) => {
    console.log("Um client se conectou!")

    socket.on('disconnect', () => {
        console.log('Cliente desconectou');
    });
})


app.get('/', (req: Request, res: Response) => {
    res.send({ message: "Hello, i'm using typescript for this project" })
});


app.use("/api/v1", apiRouter)


server.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`)
})