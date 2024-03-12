const allowOrigins = require('./allowedOrigins');

// corsOptions is object 
const corsOptions = {
    origin: (origin, callback) => {
        // we add !origin for testing in post man 
        // when production we remove !origin
        if (allowOrigins.indexOf('origin') != -1 || !origin) {
            // callback return two thing [error , origins]
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credential: true // means that any data send by request in header or cookies recieve it
    ,
    optionsSuccessStatus: 200,
};

module.exports = corsOptions;