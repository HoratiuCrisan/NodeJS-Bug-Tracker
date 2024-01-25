"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const corsOptions = {
    origin: "http:localhost:3000",
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.get("/", (req, res) => {
    res.send("<h1>Hello to node dev 1 </h1>");
});
app.post("/api/create-ticket", (req, res) => {
    const data = req.body;
    console.log(data);
});
app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
