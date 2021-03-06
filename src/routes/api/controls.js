const router = require("express").Router();
const auth = require("../auth");
const Joi = require("joi");

router.get("/", async (req, res) => {
  res.send({ message: "get controls" });
});

router.post("/make", auth, async (req, res) => {
  let response = {};
  let validate = false;
  const {
    getServerIdFromChannelId,
    getChannel
  } = require("../../models/channel");
  const { buildButtons } = require("../../models/controls");
  const { getRobotServer } = require("../../models/robotServer");

  let checkUser = await getServerIdFromChannelId(req.body.channel_id);
  console.log("CHECK USER 1: ", checkUser);
  checkUser = await getRobotServer(checkUser.result);
  console.log("CHECK USER 2: ", checkUser);

  if (checkUser.owner_id === req.user.id) validate = true;
  if (req.body.channel_id && req.body.buttons && validate) {
    const storeButtonInput = req.body.buttons;
    const checkForControls = await getChannel(req.body.channel_id);

    console.log("BUTTON CHECK FROM API ///////////", storeButtonInput);
    console.log("CHECK FOR CONTROLS CHECK: ", checkForControls);
    const setControls = await buildButtons(
      req.body.buttons,
      req.body.channel_id,
      checkForControls.controls
    );

    //Check for controls reference to update first,
    //If none exists, then build buttons.

    console.log("Setting controls from API: ", setControls);
    response.status = "success";
    response.result = setControls;
  } else {
    response.status = "error!";
    response.error = "could not generate controls from input";
  }
  res.send(response);
});

router.post("/button-input", auth, async (req, res) => {
  if (req.body.channel_id) {
    const { getButtonInputForChannel } = require("../../controllers/controls");
    const input = await getButtonInputForChannel(req.body.channel_id);
    res.send(input);
    return;
  }
  res.send({
    status: "error!",
    error: "unable to get button input"
  });
});

module.exports = router;
