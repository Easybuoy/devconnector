const express = require('express');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

//Load Input validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

const keys = require('../../config/keys');
//load user model
const User = require('../../models/User');
const router = express.Router();

// @route   GET api/users/test
//@desc     Test users route
//@access   Public
router.get('/test', (req, res) => {
    res.json({msg: 'Users works'});
});


// @route   POST api/users/register
//@desc     Register user
//@access   Public
router.post('/register', (req, res) => {
    const {errors, isValid } = validateRegisterInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }


    User.findOne({email: req.body.email})
    .then(user => {
        if(user){
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        }else{
            const avatar = gravatar.url(req.body.email, {
                s: '200', //Size
                r: 'pg', // Rating
                d: 'mm' //Default
            });

            const newUser = User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }
    })
});


// @route   POST api/users/register
//@desc     Login user / Returning JWT Token
//@access   Public
router.post('/login', (req, res) => {
    const {errors, isValid } = validateLoginInput(req.body);

    //Check validation
    if(!isValid){
        return res.status(400).json(errors);
    }


    const {email, password} = req.body;
    User.findOne({email})
    .then(user => {
        //Check if user exist
        if(!user){
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        //Check password match
        bcrypt.compare(password, user.password)
        .then(match => {
            if(!match){
                errors.password = 'Incorrect password';
               return res.status(400).json(errors);
            }else{
                //user matched
                const payload = {id: user._id, name: user.name,avatar: user.avatar } //Create JWT payload

                //Sign token
                jwt.sign(payload, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
                    if(err){
                        res.status(400).json({err: 'Unable to sign in'});
                    }else{
                        res.json({
                            sucess: true,
                            token: `Bearer ${token}`
                        })
                    }
                });
            }


        })
    })
})


// @route   GET api/users/current
//@desc     Return current user
//@access   Private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});


module.exports = router;