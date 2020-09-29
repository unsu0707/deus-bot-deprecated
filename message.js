const bolt = require('./index');
const global = require('./global');

const send = async(client, channel, text) => {   
  try {
    if (channel) {
      const result = await client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: channel,
        text: text,
      });
    }
    if (channel != global.STATUS_CHANNEL_ID) {
      const result = await client.chat.postMessage({
        token: process.env.SLACK_BOT_TOKEN,
        channel: global.STATUS_CHANNEL_ID,
        text: text,
      });
    }
    
  } catch(e) {
    console.log(e);
  }
};

const sendEph = async(client, channel, user, text) => {
  try {
    console.log(channel);
    console.log(user);
    const result = await client.chat.postEphemeral({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      user: user,
      text: text,
    });
  } catch(e) {
    console.log(e);
  }
}


module.exports = { send, sendEph };
