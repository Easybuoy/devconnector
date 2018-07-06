const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

//Load Input validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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

//@route   GET api/profile/handle/:handle
//@desc     Get Profile By Handle
//@access   Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({handle: req.params.handle})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user.';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

//@route   GET api/profile/user/:user_id
//@desc     Get Profile By User Id
//@access   Public
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne({handle: req.params.user_id})
    .populate('user', ['name', 'avatar'])
    .then(profile => {
        if(!profile){
            errors.noprofile = 'There is no profile for this user.';
            res.status(404).json(errors);
        }
        res.json(profile);
    })
    .catch(err => res.status(404).json({profile: 'No profile found for this user'}));
});

//@route   GET api/profile/all
//@desc     Get All Profiles
//@access   Public
router.get('/all', (req, res) => {
    const errors = {};
    Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
        if(!profiles){
            errors.noprofile = 'No Profiles found.';
            res.status(404).json(errors);
        }
        res.json(profiles);
    })
    .catch(err => res.status(404).json({profile: 'There are no profiles'}));
});


//@route   GET api/profile/experience
//@desc     Add experience to profile
//@access   Private
router.post('/experience', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid } = validateExperienceInput(req.body);

    //Check validation
    if(!isValid){ 
        return res.status(400).json(errors);
    }


    Profile.findOne({user: req.user._id})
    .then(profile => {
        const newExp = {
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to profile experience array
        profile.experience.unshift(newExp);

        profile.save().then(profile => res.json(profile));
    })
    .catch(err =>{
        errors.experience = 'Unable to Save experience';     
        res.status(404).json({errors})
    } )
});


//@route   GET api/profile/education
//@desc     Add education to profile
//@access   Private
router.post('/education', passport.authenticate('jwt', {session: false}), (req, res) => {
    const {errors, isValid } = validateEducationInput(req.body);

    //Check validation
    if(!isValid){ 
        return res.status(400).json(errors);
    }


    Profile.findOne({user: req.user._id})
    .then(profile => {
        const newEdu = {
            school: req.body.school,
            degree: req.body.degree,
            fieldofstudy: req.body.fieldofstudy,
            from: req.body.from,
            to: req.body.to,
            current: req.body.current,
            description: req.body.description
        }

        //Add to profile experience array
        profile.education.unshift(newEdu);

        profile.save().then(profile => res.json(profile));
    })
    .catch(err =>{
        errors.education = 'Unable to Save education';     
        res.status(404).json({errors})
    })
});


//@route   DELETE api/profile/experience/:exp_id
//@desc     Delete experience from profile
//@access   Private
router.delete('/education/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {
   
    Profile.findOne({user: req.user._id})
    .then(profile => {
      // Get remove index
      const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(req.params.exp_id);

      //Splice out of array
      profile.experience.splice(removeIndex, 1);

      //Save
      profile.save().then(profile => res.json(profile));
    })
    .catch(err => res.status(404).json(err))
});


module.exports = router;