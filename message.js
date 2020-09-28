const bolt = require('./index');

const send = async(client, channel, text) => {   
  try {
    const result = await client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      text: text,
    });
    
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
