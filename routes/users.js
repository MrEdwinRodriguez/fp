var express = require('express');
var router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

/* GET users listing. */
router.get('/', cors.corsWithOptions, function(req, res, next) {
  res.send('respond with a resource');
});


router.route('/signup')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post(cors.corsWithOptions, async (req, res, next) => {
  User.register(
      new User(...req.body),
      req.body.password,
      err => {
          if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({err: err});
          } else {
              passport.authenticate('local')(req, res, () => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json({success: true, status: 'Registration Successful!'});
              });
          }
      }
  );
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), async (req, res) => {
	const token = authenticate.getToken({_id: req.user._id});
	const user = await User.findById(req.user._id).exec();
	user.last_login = new Date();
	await user.save();
	res.statusCode = 200;
	res.setHeader('Content-Type', 'application/json');
	res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
  } else {
      const err = new Error('You are not logged in!');
      err.status = 401;
      return next(err);
  }
});

module.exports = router;