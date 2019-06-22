const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE,  { useNewUrlParser: true });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Error messages

const AUTH_FAIL_MSG = 'Auth failed, email not found';
const WRONG_PASS_MSG = 'Wrong password';

// Models

const { User } = require('./models/user');

// =====================
//         USERS
// =====================

app.post('/api/users/register', (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        res.status(200).json({
            success: true,
            userdata: doc
        })
    })

});

app.post('/api/users/login', (req, res) => {
    
    User.findOne({ 'email': req.body.email }, (err, user) => {
        if (!user) return res.json({ loginSuccess: false, message: AUTH_FAIL_MSG });

        user.comparePassword(req.body.password, (err, match) => {
            if (!match) return res.json({ loginSuccess: false, message: WRONG_PASS_MSG });

            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);
                
                res.cookie('w_auth', user.token).status(200).json({
                    loginSuccess: true
                })
            });
        });
    })

});



const port = process.env.PORT || 3030;

app.listen(port, () => {
    console.log(`Server running at port: ${port}`);
})