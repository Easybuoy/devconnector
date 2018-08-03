const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');



//Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); 


//DB config
const db = require('./config/keys').mongoURI;

//connecting to mongodb
mongoose.connect(db)
.then(() => {
console.log('mongodb connected');
})
.catch((err) => {
    console.log('unable to connect to mongdb', err)
});

//Passport middlewaare
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

app.get('/', (req, res) => {

});

//using routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/users',posts);

//Server static assets if in production
if(process.env.NODE_ENV === 'production'){
    //Set static folder 
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    }); 
}

console.log(process.env.NODE_ENV);
console.log(process.env.MONGO_URI);
console.log(process.env.SECRET_OR_KEY);

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(`sever listening on port ${port}`));