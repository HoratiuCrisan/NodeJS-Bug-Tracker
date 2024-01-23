require('dotenv').config()
import express from "express"
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8000

const corsOptions = {
    origin: "http:localhost:3000",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.send("<h1>Hello to node dev 1 </h1>")
})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})