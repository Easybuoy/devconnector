const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');


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

app.get('/', (req, res) => {

});

//using routes
app.use('/api/users',users);
app.use('/api/users',profile);
app.use('/api/users',posts);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`sever listening on port ${port}`));