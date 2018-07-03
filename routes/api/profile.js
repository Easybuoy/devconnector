const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load profile model
const Profile = require('../../models/Profile');
//Load user model
const User = require('../../models/User');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({msg: 'Profile works'});
});


// @route   GET api/profile/register
//@desc     Get current user profile
//@access   Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = '';

    Profile.findOne({user: req.user._id})
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }

        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
}); 


module.exports = router;