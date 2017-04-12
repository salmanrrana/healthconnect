var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var Student = require('../models/student');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/nurses', function(req, res, next) {
  Student.find({}, function(err, students) {
    if (err) { console.log('Database err: ', err) }

    res.render('nurses', {
      students: students
    })
  })
});



router.get('/studentProfile/:id', function(req, res, next) {
  Student.findById(req.params.id, function(err, student) {
    if (err) {
      console.log('err: ', err);
    }
    res.render('studentProfile', {
      image: student.image,
      name: student.name,
      birthdate: student.dob,
      guardian: student.guardian_name,
      guardian_number: student.guardian_number,
      guardian_email: student.guardian_email,
      medicalHistory: student.medications,
      allergies: student.allergies,
      immunizations: student.immunizations,
      reports: student.report,
      id: student._id
    })
  })
})

router.get('/createreport/:id', function(req, res, next) {
  console.log(req.user);
  Student.findById(req.params.id, function(err, student) {
    if (err) { console.log('err: ', err) }
    res.render('createreport', {
      name: student.name,
      image: student.image
    })
  })
})


router.post('/createreport', function(req, res, next) {
  var userId = req.user.identities[0].user_id;
  var email = req.user._json.email;

  console.log()
  console.log('id is: ', req.params.id)
  Student.findOne({
    _id: req.params.id
  }, function(err, student) {
    console.log('student is: ', student)
    student.report.push({
      date: req.body.date,
      vitals: req.body.vitals,
      symptoms: req.body.symptoms,
      notes: req.body.notes,
    });

    student.save(function(err, student) {
      if (err) {
        res.status(500).send({
          status: 'Error',
          error: err
        });
        console.log('Error: ', err);
      }

      res.json(student);
    });
  });
})

router.get('/guardian', function(req, res, next) {
  res.render('guardian');

router.get('/guardian', ensureLoggedIn, function(req, res, next) {
  console.log(req.user.displayName);
  Student.findOne({ guardian_email: req.user.displayName }, function(err, student) {
  res.render('guardian', {
    image: student.image,
    name: student.name,
    birthdate: student.dob,
    guardian: student.guardian_name,
    guardian_number: student.guardian_number,
    guardian_email: student.guardian_email,
    medicalHistory: student.medications,
    allergies: student.allergies,
    immunizations: student.immunizations,
    reports: student.report
    });
  });
});

router.get('/doctor', function(req, res, next) {
  res.render('doctor');
});

router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    // res.json(res);
    res.redirect(req.session.returnTo || '/user');
    // console.log('req4: ', req);
    console.log('res4: ', res);
  });


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Health Connect', env: env });
});

router.get('/nurse', function(req, res, next) {
  res.render('nurse');
});


router.get('/doctor', function(req, res, next) {
  res.render('doctor');
});

router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    // res.json(res);
    res.redirect('/user');
    console.log('req4: ', req);
    console.log('res4: ', res);
  });

module.exports = router;
