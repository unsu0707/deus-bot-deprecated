const global = require('../global');

module.exports = () => {
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
      "options": [
        {
          "text": {
            "type": "plain_text",
            "text": "dev",
            "emoji": true
          },
          "value": "dev"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "stg",
            "emoji": true
          },
          "value": "stg"
        },
        {
          "text": {
            "type": "plain_text",
            "text": "stg-qa01",
            "emoji": true
          },
          "value": "stgqa01"
        }
      ]
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