module.exports = app => {
  const poems = require("../controllers/poem.controller.js");

  var router = require("express").Router();

  // Create poem from given keyword
  router.post("/getPoem", poems.getPoem);

  app.use('/api', router);
};