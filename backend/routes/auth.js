const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = "Nicksz";

//Route 1:::create a user usinh :post "/api/auth/" ... doesnot requie auth  // no login required

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

    const salt = await bcrypt.genSaltSync(10);
    secPass = await bcrypt.hash(req.body.password, salt);

    //create user
    user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: secPass
    });
    // .then(user => res.json(user))
    //  .catch(err=>{console.log(err)
    //  res.json({error: "Please enter unique value",message:err.message})})
    ///////res.send(req.body);
    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);
    // console.log(jwtData);
    // res.json(user)
    res.json(authToken)
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured");
  }

})
//Route 2:::Authenticate a user u sing POST"api/auth/login"
router.post('/userlogin', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password can not be blank').exists(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(400).json({ error: "Please try to login with correct credentials" });

    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({ authToken })
  }
  catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

//Route 3 :::  get logged in user details :POST "/api/auth/getuser" . login required
router.post('/getuser', fetchuser, async (req, res) => {

  try {
    //userId=re.user.id;
    const userId = req.user;
    const user = await User.findOne({userId}).select("-password");
    //const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
})

module.exports = router