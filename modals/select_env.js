const global = require('../global');
const store = require('../store');

module.exports = () => {
  var envKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "env");

  var options = [];
  for ( const env of envKeywords.split(", ") ) {
    options.push({
      "text": {
        "type": "plain_text",
        "text": `${env}`,
        "emoji": true
      },
      "value": `${env}`,
    });
  }
  const SELECT_ENV_BLOCK = {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "環境を選んでください"
    },
    "accessory": {
      "type": "static_select",
      "action_id": "env_selected",
      "placeholder": {
        "type": "plain_text",
        "text": "env",
        "emoji": true
      },
      "options": options
    }
  }

  return {
    type: 'modal',
    callback_id: 'deus_view_1',
    title: {
      type: 'plain_text',
      text: global.APP_NAME,
    },
    blocks: [
      SELECT_ENV_BLOCK
    ],
  }
}