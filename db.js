const mongoose = require('mongoose');
const mongooseURI = process.env.DATABASE

const connectToDatabase = () => {
    mongoose.connect(mongooseURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to Database Successfully");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error);
    });
}

module.exports = connectToDatabase;
