const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors({
  origin: "https://notewave.onrender.com/", // Allow requests from your frontend origin
  methods: 'GET, POST, PUT, DELETE', // Specify the allowed methods, including DELETE
  optionsSuccessStatus: 204, // Respond to preflight requests with a 204 No Content status
}));
require('dotenv').config(); // .env-config

const connectToDatabase  = require('./db'); //Database-connection-code
connectToDatabase(); //Database-connection-intialise

// Middlewares:
app.use(express.json());

// Routing:
app.use('/auth', require('./routes/auth'));
app.use('/notes', require('./routes/notes'));

app.listen(process.env.PORT, ()=>{
    console.log("Server is Running");
})
