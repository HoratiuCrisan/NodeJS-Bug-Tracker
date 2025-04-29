import express from "express";
import cors from "cors";
import router from "./routes/versioning";
import { errorHandler } from "@bug-tracker/usermiddleware";

const app = express();
const PORT = 8006;

app.use(express.json());


app.use(cors({
    origin: "http://localhost:3000/",
    methods: ["POST", "GET", "PUT", "DELETE"],
}));

app.use("/api/versions", router);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Versioning system running on port: ${PORT}`);
});