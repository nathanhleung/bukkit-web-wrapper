const request = require("request");
const qs = require("qs");

const logger = require("../logger");
const minecraftServer = require("../minecraft-server");
const { queryUserByUserID } = require("../db/queries");

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

  queryUserByUserID(req.session.userId, (err, user) => {
    if (err) {
      logger.error(err);
      return res.json({
        success: false
      });
    }
    const { minecraft_user } = user;
    withdrawFromCoinhive(minecraft_user);
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
    minecraftServer.stdin.write(`eco give ${username} ${amount / 1000}\n`);
    return res.json({
      success: true
    });
  }
}

module.exports = {
  getApiUserHashBalance,
  postApiUserHashWithdraw
};
