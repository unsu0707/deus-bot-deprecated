const { App } = require('@slack/bolt');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message(/とのランダムで絵文字つけて[ ]?([1-9]|1[0-9]|20)$/, async ({ message, say, context }) => {
  const num = context.matches[1];
  const ts = new Date();
  try {
    const emojiList = await app.client.apiCall('emoji.list', {
      token: context.botToken});
    const emojiNames = Object.keys(emojiList.emoji);
    for (var i=0;i<num;i++){
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
/*
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
      for (var i=0;i<num;i++){
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
      for (var i=0;i<emojiNames.length;i++){
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
*/
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
/*
app.event('view_submission', async ({ ack, payload }) => {
  await ack();
  await console.log(payload);
});*/

app.action('button_click', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();
  await say(`<@${body.user.id}>よ、質問は受け付けないぞ。`);
});