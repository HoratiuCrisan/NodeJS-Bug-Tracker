require('dotenv').config()
import { Response, Request } from "express"
import express from "express"
import cors from 'cors'
const {db} = require('./config/firebase-config')

const app = express()
const PORT = process.env.PORT || 8000

const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())



app.get("/", (req: Request, res: Response) => {
    res.send("<h1>Hello to node dev 1 </h1>")
})

app.post("/api/create-ticket", async (req: Request, res: Response) => {
    const {formData, author, authorPicture} = req.body
    
    const createTicket = await db.collection('Tickets').add({
        "Title": formData.title,
        "Description": formData.description,
        "Author": author,
        "AuthorPicture": authorPicture,
        "Priority": formData.priority.label,
        "Type": formData.type.label,
        "Status": "New",
        "Handler": "",
        "Deadline": formData.deadline
    })
    res.status(200).send(createTicket)
})

app.get("/api/get-tickets", async(req: Request, res: Response) => {
    try {
        const response = await db.collection('Tickets').get()
        const tickets: any = []

        response.forEach((doc:any) => {
            tickets.push({
                id: doc.id,
                data: doc.data()
            })
        })

        res.json(tickets)
    } catch (error) {
        console.error('Error at retrieving tickets from db', error)
        res.send(500).json({error: 'Internal Server Error'})
    }
})

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})