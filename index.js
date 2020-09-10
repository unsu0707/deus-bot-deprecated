const { App } = require('@slack/bolt');
const store = require('./store');
const appHome = require('./appHome');
const message = require('./message');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

store.init();
// fril_admin:develop を開発機にデプロイしたで〜 by yu.shimizu
app.event('message', async ({ event, context }) => {
  try {
    if (event.subtype == 'bot_message'){
      let text = event.attachments ? event.attachments[0].text : event.text;
      let matched = text.match(/fril[_-]([a-z]+):([^ ]+) を開発機に(デプロイしました|デプロイしたで|デプロイします|デプロイすんで).* by (.+)/);
      if (matched){ 
        let [app, branch, status, user] = [matched[1], matched[2], matched[3], matched[4]];
        //console.log(matched);
        switch (status) {
          case "デプロイします":
          case "デプロイすんで":
            status = 'deploying';
            break;
          default:
            status = 'deployed';
            break;
        }
        store.setBranch('dev', app, branch);
        let message = `なるほど、今は fril_${matched[1]}に ${matched[2]}ブランチを ${status}ですね。理解しました！`;
        //console.log(message);
      }
    }
  }
  catch (error) {
    console.error(error);
  }
});
/*
app.message(/fril_([a-z]+):([^ ]+) を開発機に(デプロイしました|デプロイしたで|デプロイします|デプロイすんで)./, async ({ message, context, say }) => {
  // context.matches の内容が特定の正規表現と一致
  console.log(message);
  console.log(context);
  let status = 'deployed';
  switch (context.matches[3]) {
    case "デプロイします":
    case "デプロイすんで":
      status = 'deploying';
      break;
  }
  await say(`なるほど、今は <@${message.user}>が fril_${context.matches[1]}に ${context.matches[2]}ブランチを ${status}ですね。理解しました！`);
});
*/
// /tono [cmd] [env] [app]

app.command('/tono', async ({ command, ack, say, body, client }) => {
  await ack();
  let [cmd, env, app] = command.text.split(' ');
  let result = '';
  let current_user_data = '';
  if (!store.isValidKeywords(env, app) && cmd != 'help' && cmd != 'modal') {
    result = `${env}-${app} is not invalid. (valid keywords : ${store.getValidKeywords()})`;
  } else {
    switch (cmd) {
      case 'lend':
        current_user_data = store.getUserData(env, app);
        if (!current_user_data) {
          if (store.setUser(env, app, command.user_id))
            result = `<@${command.user_id}> use ${env}-${app} from now!`;
          else
            result = 'error!';
        } else {
          result = `${env}-${app} is already being used by <@${current_user_data[0]}>`;
        }
        break;
      case 'check':
        current_user_data = store.getUserData(env, app);
        if (current_user_data)
          result = `${env}-${app} is being used by <@${current_user_data[0]}>`;
        else
          result = `${env}-${app} is not used by anyone`;
        break;
      case 'return':
        current_user_data = store.getUserData(env, app);
        console.log(`${current_user_data[0]} ${command.user_id}`)
        if (current_user_data[0] == command.user_id) {
          store.unsetUser(env, app);
          result = `<@${current_user_data[0]}> returned ${env}-${app}`;
        } else {
          result = `You can only return ${env}-${app} when you are in use.`;
        }
        break;
      case 'modal':
        const result = await client.views.open({
          // 適切な trigger_id を受け取ってから 3 秒以内に渡す
          trigger_id: body.trigger_id,
          // view の値をペイロードに含む
          view: {
            type: 'modal',
            // callback_id が view を特定するための識別子
            callback_id: 'view_1',
            title: {
              type: 'plain_text',
              text: 'Modal title'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: 'Welcome to a modal with _blocks_'
                },
                accessory: {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'Click me!'
                  },
                  action_id: 'button_abc'
                }
              },
              {
                type: 'input',
                block_id: 'input_c',
                label: {
                  type: 'plain_text',
                  text: 'What are your hopes and dreams?'
                },
                element: {
                  type: 'plain_text_input',
                  action_id: 'dreamy_input',
                  multiline: true
                }
              }
            ],
            submit: {
              type: 'plain_text',
              text: 'Submit'
            }
          }
        });
        console.log(`result : ${result}`);
        break;
      case 'help':
        result = `/tono lend [env] [app]
/tono check [env] [app]
/tono return [env] [app]
/tono help
[env] keywords : ${store.getEnvKeywords().env.join(",")}
[app] keywords : ${store.getEnvKeywords().app.join(",")}
*Tips* : 私のホーム画面に行くと、使用状況が一つの画面で見れますよ！ :eyes: (Click Me > Click 'Go To App' Menu!)`;
    }
  }
  await say(result);
});

app.message(/とのランダムで絵文字つけて[ ]?([1-9]|1[0-9]|20)$/, async ({ message, say, context }) => {
  const num = context.matches[1];
  const ts = new Date();
  try {
    const emojiList = await app.client.apiCall('emoji.list', {
      token: context.botToken});
    const emojiNames = Object.keys(emojiList.emoji);
    for (let i=0;i<num;i++){
      const result = await app.client.apiCall('reactions.add', {
        token: context.botToken,
        channel: message.channel,
        name: emojiNames[Math.floor(Math.random() * emojiNames.length)],
        timestamp: message.event_ts,
      });
    }

  } catch(e) {
    console.log(e);
    app.error(e);
  }
});

app.event('reaction_removed', async ({ event, context }) => {
  console.log("--removed--");
  console.log(event);
  console.log(context);
});

app.event('reaction_added', async ({ event, context }) => {
  console.log("--added--");
  console.log(event);
  console.log(context);
  if (event.reaction == 'tonotan') {
    const num = '20';
    const ts = new Date();
    try {
      console.log('get list');
      const emojiList = await app.client.apiCall('emoji.list', {
        token: context.botToken});
      const emojiNames = Object.keys(emojiList.emoji);
      for (let i=0;i<num;i++){
        console.log('add react');
        const result = await app.client.apiCall('reactions.add', {
          token: context.botToken,
          channel: event.item.channel,
          name: emojiNames[Math.floor(Math.random() * emojiNames.length)],
          timestamp: event.item.ts,
        });
      }

    } catch(e) {
      console.log(e);
      app.error(e);
    }
  }
  if (event.reaction == 'tono') {
    try {
      const emojiList = await app.client.apiCall('reactions.get', {
        token: context.botToken,
        channel: event.item.channel,
        timestamp: event.item.ts
      });
      const botUserId = context.botUserId;
      const emojiNames = emojiList.message.reactions;
      for (let i=0;i<emojiNames.length;i++){
        if (emojiNames[i].users[0] == botUserId) {
          const result = await app.client.apiCall('reactions.remove', {
            token: context.botToken,
            name: emojiNames[i].name,
            channel: event.item.channel,
            timestamp: event.item.ts,
          });
        }
      }
    } catch(e) {
      console.log(e);
      app.error(e);
    }
  }
});

// Listens to incoming messages that contain "hello"
app.message('とのたん', async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `なんだよ <@${message.user}>!`
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "質問"
          },
          "action_id": "button_click"
        }
      }
    ],
    text: `なんだよ <@${message.user}>!`
  });
});

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}>よ、質問は受け付けないぞ。`);
});


app.event('app_home_opened', async ({ event, context, payload }) => {
  // Display App Home
  const homeView = await appHome.createHome(event.user);
  
  try {
    const result = await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: homeView
    });
    
  } catch(e) {
    app.error(e);
  }
});

// Receive button actions from App Home UI "Add a Stickie"
app.action('add_note', async ({ body, context, ack }) => {
  ack();
  
  // Open a modal window with forms to be submitted by a user
  const view = appHome.openModal();
  
  try {
    const result = await app.client.views.open({
      token: context.botToken,
      trigger_id: body.trigger_id,
      view: view
    });
    
  } catch(e) {
    console.log(e);
    app.error(e);
  }
});

// Receive view_submissions
app.view('modal_view', async ({ ack, body, context, view }) => {
  ack();
  
  const ts = new Date();

  const homeView = await appHome.createHome(body.user.id);

  try {
    const result = await app.client.apiCall('views.publish', {
      token: context.botToken,
      user_id: body.user.id,
      view: homeView
    });

  } catch(e) {
    console.log(e);
    app.error(e);
  }
    
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('Bolt Tono App Is Running!');
})();
