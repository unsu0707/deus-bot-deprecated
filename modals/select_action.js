const global = require('../global');
const store = require('../store');

module.exports = (env, user_id, msg = null) => {
  var headMsg = `${env}環境での使用状況です。アクションを選んでください。`;
  if (msg != null) {
    headMsg = msg + "\n" + headMsg;
  }
  // Action : Lend : 未使用の時, Return : 自分が使用中, Wait : 使用中, Book : いつでも
  var blocks = [{
    "type": "section",
    "text": {
      "type": "plain_text",
      "emoji": true,
      "text": headMsg,
    }
  }];
  
  var appKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "app");
  for ( var app of appKeywords.split(", ") ) {
    blocks.push({
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
      blocks.push({
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
      let start_at = userData.start_at != null ? global.sampleDate(new Date(userData.start_at), 'MM-DD HH:mm') : '';
      let end_at = userData.end_at != null ? global.sampleDate(new Date(userData.end_at), 'MM-DD HH:mm') : '';
      let action_text = "次借りる";
      let action_id = "push_waiting_button";
      if (userData.user == user_id) {
        action_text = "返す";
        action_id = "push_return_button";
      } else if (store.isUsing(global.STORAGE_NAME.WAITING, env, app, user_id)) {
        action_text = "待機やめる";
        action_id = "push_cancel_button";
      }
      let usage_text = `使用中 (<@${userData.user}> ${start_at}~${end_at})`;
      let waitingUserData = store.getUserData(global.STORAGE_NAME.WAITING, env, app);
      if (waitingUserData.length > 0) {
        usage_text += `\n待機中 (`;
        for (const [i, value] of waitingUserData.entries()) {
          usage_text += `${i+1}: <@${value.user}>, `;
        }
        usage_text = usage_text.slice(0, -2);
        usage_text += `)`;
      }
      blocks.push({
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
      if (userData.branch) {
        blocks.push({
          "type": "context",
          "elements": [
            {
              "type": "mrkdwn",
              "text": `:clipboard: 現在のブランチ名: ${userData.branch}`
            }
          ]
        });
      }
    }
  }
  
  return {
    type: 'modal',
    callback_id: 'deus_view_2',
    title: {
      type: 'plain_text',
      text: global.APP_NAME,
    },
    blocks: blocks,
  }
}