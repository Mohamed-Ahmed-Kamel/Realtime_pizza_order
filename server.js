require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3030;
const ejs = require("ejs");
const path = require("path");
const expressLayout = require("express-ejs-layouts");
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const mongogStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events');

// Database connection
mongoose.connect(process.env.MONGO_CONNECT)
.then(() => {
    console.log("mongogDB connect");
}).catch((err) => {
    console.log(`Error: ${err}`);
});

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

// Session config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongogStore.create({
        mongoUrl: process.env.MONGO_CONNECT,
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24h
}))

// Passport: Authenticate Requests
const passportInit = require('./app/config/passport');
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

// Assets
app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.user;
    next();
});

// Set template engine
app.use(expressLayout);
app.set("views", path.join(__dirname, "/resources/views"));
app.set('view engine', 'ejs');

require('./routes/web')(app)

const server = app.listen(port, console.log(`Server start on port: ${port}`));

// Socket.io
const io = require('socket.io')(server);
io.on('connection', (socket) => {
    socket.on('join', (orderID) => {
        socket.join(orderID)
    })
})
eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data._id}`).emit('orderUpdated', data)
})
eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})