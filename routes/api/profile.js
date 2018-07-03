const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load Input validation
const validateProfileInput = require('../../validation/profile');

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
    const errors = {};
    Profile.findOne({user: req.user._id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }

        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
}); 


// @route   POST api/profile/register
//@desc     Create or Edit user profile
//@access   Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid } = validateProfileInput(req.body);

    //Check validation
    if(!isValid){ 
        return res.status(400).json(errors);
    }
//Get fields
const profileFields = {};
profileFields.user = req.user.id;

if(req.body.handle) profileFields.handle = req.body.handle;
if(req.body.company) profileFields.company = req.body.company;
if(req.body.website) profileFields.website = req.body.website;
if(req.body.location) profileFields.location = req.body.location;
if(req.body.bio) profileFields.bio = req.body.bio;
if(req.body.status) profileFields.status = req.body.status;
if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;
//Skills - Split to array
if(typeof req.body.skills !== 'undefined'){
    profileFields.skills = req.body.skills.split(','); 
} 
// Social
profileFields.social = {};

if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
if(req.body.twitter) profileFields.social.twitter = req.body.twitter;

Profile.findOne({user: req.user._id})
.then(profile => {
    if(profile){
        // Update
        Profile.findOneAndUpdate({ user: req.user._id}, {$set: profileFields}, {new: true})
        .then(profile => res.json(profile));
    }else{
        // Create

        //Check if handle exists
        Profile.findOne({handle: profileFields.handle})
        .then(profile => {
            if(profile){
                errors.handle = 'Handle exists already';
                res.status(400).json(errors);
            }

            //Save profile
            new Profile(profileFields).save().then(profile => res.json(profile));
        })
    }
})


if(req.body.handle) profileFields.handle = req.body.handle;
if(req.body.handle) profileFields.handle = req.body.handle;

}); 

// @route   GET api/profile/handle/: 
//@desc     Create or Edit user profile
//@access   Private


module.exports = router;