const store = require('./store');
const global = require('./global');
const app = require('./index');

/*
 * Home View - Use Block Kit Builder to compose: https://api.slack.com/tools/block-kit-builder
 */

const updateView = async(user) => {
  // Intro message - 
  console.log(`${user} visited AppHome`);
  var blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Hello!* \nここはTonotanのホーム画面です！! ここで、開発環境の使用状況の確認ができますよ :man-raising-hand:"
      }
    },
    {
      type: "divider"
    }
  ];
  
  // env stats blocks
  var envKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "env");
  
  var statBlocks = [];
  for ( const env of envKeywords.split(", ") ) {
    statBlocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `${env}`,
      },
    });
    var appKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "app");
    for ( const app of appKeywords.split(", ") ) {
      statBlocks.push({
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `:tonotan_${env}_${app}: *(${env.toUpperCase()}) fril_${app}*`
        }
      });
      var userData = store.getUserData(global.STORAGE_NAME.ENV_STATS, env, app);
      if (!userData) {
        statBlocks.push({
          "type": "section",
          "block_id": `${env}_${app}`,
          "text": {
            "type": "mrkdwn",
            "text": "未使用"
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": "借りる"
            },
            "action_id": "push_lend_button"
          }
        });
      } else {
        var start_at = userData.start_at != null ? global.sampleDate(new Date(userData.start_at), 'MM-DD HH:mm') : '';
        var end_at = userData.end_at != null ? global.sampleDate(new Date(userData.end_at), 'MM-DD HH:mm') : '';
        var action_text = "次借りる";
        var action_id = "push_waiting_button";
        if (userData.user == user) {
          action_text = "返す";
          action_id = "push_return_button";
        }
        var usage_text = `使用中 (<@${userData.user}> ${start_at}~${end_at})`;
        var waitingUserData = store.getUserData(global.STORAGE_NAME.WAITING, env, app);
        if (waitingUserData.length > 0) {
          usage_text += `\n待機中 (`;
          for (const [i, value] of waitingUserData.entries()) {
            usage_text += `${i+1}: <@${value.user}>, `;
          }
          usage_text = usage_text.slice(0, -2);
          usage_text += `)`;
        }
        statBlocks.push({
          "type": "section",
          "block_id": `${env}_${app}`,
          "text": {
            "type": "mrkdwn",
            "text": usage_text,
          },
          "accessory": {
            "type": "button",
            "text": {
              "type": "plain_text",
              "emoji": true,
              "text": action_text
            },
            "action_id": action_id
          }
        });
      }
    }
    statBlocks.push({
      type: "divider"
    });
  }
  blocks = blocks.concat(statBlocks);
  // The final view -
  
  var view = {
    type: 'home',
    callback_id: 'home_view',
    title: {
      type: 'plain_text',
      text: 'Test!'
    },
    blocks: blocks
  }
  
  return JSON.stringify(view);
};



/* Display App Home */

const createHome = async(user) => {
  
  const userView = await updateView(user);
  
  return userView;
};

module.exports = { createHome };