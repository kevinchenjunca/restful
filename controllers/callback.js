const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../services/auth-config');

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({sub: user.id, iat: timestamp }, config.secret);  //iat: issued at the time
}


exports.access = function(req,res) {
  res.send({ message: 'Super secret code is ABC123'});
};

exports.signin = function(req,res,next) {
  //user has already had their email and password  auth'd
  //we just need to give them a token
  res.send({token: tokenForUser(req.user)});
}

exports.signup = function(req,res,next) {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      res.status(422).send({error: 'You must provide email and password'});
    }
    User.findOne({email: email}, function(err, existingUser){
      if (err) { return next(err); };

      if (existingUser) {
        return res.status(422).send({error:'Email is in use'});
      };

      const user = new User({
          email: email,
          password: password
      });

      user.save(function(err){
        if (err) { return next(err);}
        res.json({token: tokenForUser(user)});
      });
    });
}
