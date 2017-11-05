const request = require("request");
const qs = require("qs");
const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");

const logger = require("../logger");
const { findUserById } = require("../helpers");
const { essentialsUserDataDir } = require("../constants");

function getApiUserHashBalance(req, res) {
  const data = {
    secret: process.env.COINHIVE_SECRET,
    name: req.session.userId
  };

  const query = qs.stringify(data);
  request.get(
    {
      url: `https://api.coinhive.com/user/balance?${query}`
    },
    (err, httpResponse, body) => {
      if (err) {
        logger.error(err);
        return res.json({
          success: false
        });
      }
      try {
        const json = JSON.parse(body);
        if (!json.success) {
          logger.error(json.error);
          return res.json({
            success: false
          });
        }
        const { total, balance } = json;
        return res.json({
          success: true,
          total,
          balance
        });
      } catch (err) {
        logger.error(err);
        return res.json({
          success: false
        });
      }
    }
  );
}

function postApiUserHashWithdraw(req, res) {
  const { amount } = req.body;

  findUserById(req.session.userId, (err, user) => {
    if (err) {
      logger.error(err);
      return res.json({
        success: false
      });
    }
    const { username } = user;
    withdrawFromCoinhive(username);
  });

  function withdrawFromCoinhive(username) {
    const data = {
      secret: process.env.COINHIVE_SECRET,
      name: req.session.userId,
      amount
    };

    request.post(
      {
        url: "https://api.coinhive.com/user/withdraw",
        form: data
      },
      (err, httpResponse, body) => {
        parseCoinhiveResponse(err, httpResponse, body, username);
      }
    );
  }

  function parseCoinhiveResponse(err, httpResponse, body, username) {
    if (err) {
      logger.error(err);
      return res.json({
        success: false
      });
    }
    try {
      const json = JSON.parse(body);
      if (!json.success) {
        logger.error(json.error);
        return res.json({
          success: false
        });
      }
      // If no error yet, we're good
      return updateUserBalance(username);
    } catch (err) {
      logger.error(err);
      return res.json({
        success: false
      });
    }
  }

  function updateUserBalance(username) {
    // Essentials makes all usernames lowercase in data files
    const normalizedUsername = username.toLowerCase();
    const userDataFile = path.join(
      essentialsUserDataDir,
      `${normalizedUsername}.yml`
    );
    try {
      const userData = yaml.safeLoad(fs.readFileSync(userDataFile, "utf8"));
      const { money } = userData;

      // 1000:1 ratio for hash to dollar conversion
      if (typeof money === "undefined") {
        userData.money = Number((amount / 1000).toFixed(3));
      } else {
        userData.money = Number(money) + Number((amount / 1000).toFixed(3));
      }
      fs.writeFileSync(userDataFile, yaml.safeDump(userData));

      return res.json({
        success: true
      });
    } catch (err) {
      logger.error(err);
      return res.json({
        success: false
      });
    }
  }
}

module.exports = {
  getApiUserHashBalance,
  postApiUserHashWithdraw
};
