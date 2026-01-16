import express, { type Request, type Response } from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuring Api Server
const app = express()
const PORT = 5000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(path.join(__dirname, 'static')))


app.listen(PORT, () => {
    console.log(`Listening on Port: ${PORT}`)
})

app.get('/', (req: Request, res: Response) => {
    res.send({ message: "Hello, i'm using typescript for this project" })
});


app.use("/api/v1", apiRouter)