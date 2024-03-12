require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const path = require('path');

connectDB();

// NOTE :: cores define before routes
// CORS allow web servers to specify which origins aare permitted to access resources of a server using a web browser
app.use(cors(corsOptions));
app.use(cookieParser());
// allow server to recieve json data
app.use(express.json());

// allow server to use static files
app.use('/', express.static(path.join(__dirname, 'public')));


app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/users', require('./routes/userRoutes'));



// hamdel any invalid routs 
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.json({
            message:"404 Not Found"
        })
    }
    else {
        res.type("txt").send('404 Not Found')
    }
})

// once i connect to database start server
mongoose.connection.once('open', () => {
    console.log(`Connected to MongoDB`);

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

// if there are any error in conection display it
mongoose.connection.on('error', (error) => {
    console.log(error);
});


