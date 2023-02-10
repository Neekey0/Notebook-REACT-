const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');

//create a user usinh :post "/api/auth/" ... doesnot requie auth  // no login required

router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Enter password must be greater than 5').isLength({ min: 5 })
], async (req, res) => {

  //If there are errors return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  //check whether user's email exist 

  try {

    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with the email already exist" })
    }
    //create user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    })
    // .then(user => res.json(user))
    //  .catch(err=>{console.log(err)
    //  res.json({error: "Please enter unique value",message:err.message})})
    ///////res.send(req.body);
    res.json(user)
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occuresd");
  }

})

module.exports = router