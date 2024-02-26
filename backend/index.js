const express = require("express");
const rootRouter = require("./routes");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config()

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/v1',rootRouter);

app.use((err,req,res,next) => {
    console.log("err");

    res.status(500).json({
        message: "Internal server error"
    })
})

app.listen(PORT,() => {
    console.log(`Listening on ${PORT}`)
})