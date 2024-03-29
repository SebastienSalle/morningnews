var express = require("express");
var router = express.Router();

var uid2 = require("uid2");
var bcrypt = require("bcrypt");

var userModel = require("../models/users");
//var articleModel = require("../models/articles");

router.post("/sign-up", async function (req, res, next) {
  var error = [];
  var result = false;
  var saveUser = null;
  var token = null;

  const data = await userModel.findOne({
    email: req.body.emailFromFront,
  });

  if (data != null) {
    error.push("utilisateur déjà présent");
  }

  if (
    req.body.usernameFromFront == "" ||
    req.body.emailFromFront == "" ||
    req.body.passwordFromFront == ""
  ) {
    error.push("champs vides");
  }

  if (error.length == 0) {
    var hash = bcrypt.hashSync(req.body.passwordFromFront, 10);
    var newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: hash,
      token: uid2(32),
      wishList: [],
      languagePref: "fr",
    });

    saveUser = await newUser.save();

    if (saveUser) {
      result = true;
      token = saveUser.token;
    }
  }

  res.json({ result, saveUser, error, token });
});

router.post("/sign-in", async function (req, res, next) {
  var result = false;
  var user = null;
  var error = [];
  var token = null;

  if (req.body.emailFromFront == "" || req.body.passwordFromFront == "") {
    error.push("champs vides");
  }

  if (error.length == 0) {
    user = await userModel.findOne({
      email: req.body.emailFromFront,
    });

    if (user) {
      if (bcrypt.compareSync(req.body.passwordFromFront, user.password)) {
        result = true;
        token = user.token;
      } else {
        result = false;
        error.push("mot de passe incorrect");
      }
    } else {
      error.push("email incorrect");
    }
  }

  res.json({ result, user, error, token });
});

router.post("/addToWishList", async function (req, res, next) {
  //save article to bdd au clic sur like
  var data = await userModel.findOne({ token: req.body.token });
  console.log(req.body.token);

  data.wishList.push({
    title: req.body.title,
    content: req.body.content,
    description: req.body.description,
    urlToImage: req.body.urlToImage,
    language: req.body.language,
  });
  await data.save();

  res.json({ data });
});

router.post("/deleteFromWishList", async function (req, res, next) {
  var result = false;
  var data = await userModel.findOne({ token: req.body.token });
  var deleteWishList = data.wishList.filter(
    (element) => element.title !== req.body.title
    );
  data.wishList = deleteWishList;
    await data.save();
  result = true;
  res.json({ result });
});

module.exports = router;
