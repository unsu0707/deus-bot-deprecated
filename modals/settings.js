const global = require('../global');
const store = require('../store');

const setKeywords = () => {
  let envKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "env");
  let appKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "app");
  
  return {
    "type": "modal",
    "callback_id": "setting_keyword_modal",
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "title": {
      "type": "plain_text",
      "text": "DEUS",
      "emoji": true
    },
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": "環境名、リポジトリ名の種類を設定してください。",
          "emoji": true
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "input",
        "block_id": "env",
        "label": {
          "type": "plain_text",
          "text": "環境名 (ex: dev, stg, qa)",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input",
          "initial_value": `${envKeywords}`,
          "action_id": "name",
          "placeholder": {
            "type": "plain_text",
            "text": "dev, stg",
            "emoji": true
          }
        }
      },
      {
        "type": "input",
        "block_id": "app",
        "label": {
          "type": "plain_text",
          "text": "リポジトリ名 (ex: web, api, admin)",
          "emoji": true
        },
        "element": {
          "type": "plain_text_input",
          "initial_value": `${appKeywords}`,
          "action_id": "name",
          "placeholder": {
            "type": "plain_text",
            "text": "web, api, admin",
            "emoji": true
          }
        }
      }
    ]
  }
}

const setSubKeywords = () => {
  let blocks = [
    {
      "type": "section",
      "text": {
        "type": "plain_text",
        "text": "代替単語を設定してください。",
        "emoji": true
      }
    },
    {
      "type": "divider"
    }
  ]
  let envKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "env");
  let appKeywords = store.getKeywords(global.STORAGE_NAME.KEYWORDS, "app");
  
  for ( const env of envKeywords.split(", ") ) {
    let keywords = store.getKeywords(global.STORAGE_NAME.SUB_KEYWORDS, env);
    blocks.push(
    {
      "type": "input",
      "block_id": `${env}`,
      "label": {
        "type": "plain_text",
        "text": `${env}`,
        "emoji": true
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "name",
        "initial_value": `${keywords}`,
      }
    });
  }
  
  blocks.push({
    "type": "divider"
  });
  
  for ( const app of appKeywords.split(", ") ) {
    let keywords = store.getKeywords(global.STORAGE_NAME.SUB_KEYWORDS, app);
    blocks.push(
    {
      "type": "input",
      "block_id": `${app}`,
      "label": {
        "type": "plain_text",
        "text": `${app}`,
        "emoji": true
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "name",
        "initial_value": `${keywords}`,
      }
    });
  }
      
  return {
    "type": "modal",
    "callback_id": "setting_subkeyword_modal",
    "submit": {
      "type": "plain_text",
      "text": "Submit",
      "emoji": true
    },
    "close": {
      "type": "plain_text",
      "text": "Cancel",
      "emoji": true
    },
    "title": {
      "type": "plain_text",
      "text": "DEUS",
      "emoji": true
    },
    "blocks": blocks
  }
}


module.exports = { setKeywords, setSubKeywords };