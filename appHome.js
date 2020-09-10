const store = require('./store');
const app = require('./index');

/*
 * Home View - Use Block Kit Builder to compose: https://api.slack.com/tools/block-kit-builder
 */
function sampleDate(date, format) {
 
    format = format.replace(/YYYY/, date.getFullYear());
    format = format.replace(/MM/, date.getMonth() + 1);
    format = format.replace(/DD/, date.getDate());
    format = format.replace(/HH/, date.getHours());
    format = format.replace(/mm/, date.getMinutes());
 
    return format;
}

const updateView = async(user) => {
  // Intro message - 
  console.log(`${user} visited AppHome`);
  let blocks = [ 
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Hello!* \nここはTonotanのホーム画面です！ ここで、開発環境の使用状況の確認ができますよ :man-raising-hand:"
      }
    },
    {
      type: "divider"
    }
  ];
  
  // env stats blocks
  const envKeywords = store.getEnvKeywords();
  
  let statBlocks = [];
  envKeywords.env.forEach((env) => {
    statBlocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `${env}`,
      },
    });
    envKeywords.app.forEach((app) => {
      let currentUserData = store.getUserData(env, app);
      let availableAction = '';
      let statusText = `:tonotan_${env}_${app}: *${app}*`;
      let statusText2 = ' ';
      let statusText3 = ' ';
      if (currentUserData) {
        statusText2 = `Using (*Branch name: ${currentUserData[2]}*)`;
        let date = sampleDate(new Date(currentUserData[1]), 'YYYY年MM月DD日 HH:mm');
        statusText3 = `<@${currentUserData[0]}> (${date})`;
        availableAction = (currentUserData[0] == user) ? 'return' : 'wait';
      } else {
        statusText2 = 'Not Using';
        availableAction = 'lend';
      }
      console.log(`${app} > ${statusText} ${statusText2} ${statusText3} ${availableAction}`);
      statBlocks.push({
        "type": "section",
        "fields": [{
          "type": "mrkdwn",
          "text": statusText,
        },{
          "type": "mrkdwn",
          "text": statusText3,
        }],
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "emoji": true,
            "text": availableAction
          },
          "value": availableAction
        }
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": `${statusText2}`,
          }
        ]
      });
    });
    statBlocks.push({
      type: "divider"
    });
  });
  blocks = blocks.concat(statBlocks);
  // The final view -
  
  let view = {
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



/* Open a modal */

const openModal = () => {
  
  const modal = {
    type: 'modal',
    callback_id: 'modal_view',
    title: {
      type: 'plain_text',
      text: 'Create'
    },
    submit: {
      type: 'plain_text',
      text: 'Create'
    },
    blocks: [
    ]
  };
  
  return modal;
};


module.exports = { createHome, openModal };