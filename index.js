const { App } = require('@slack/bolt');
const global = require('./global');
const store = require('./store');
const appHome = require('./appHome');
const message = require('./message');
const selectEnvModal = require('./modals/select_env');
const selectActionModal = require('./modals/select_action');
const settingsModal = require('./modals/settings');

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

store.init();
// /deus st
// command.channel_id, command.user_id, context.botToken
// /deus lend stg api

function guessKeyword(word) {
  return store.getKeyFromKeyword(word);
}

app.command('/deus', async ({ ack, command, client }) => {
  await ack();
  try {
    var result;
    if (command.text == '') {
      result = await client.views.open({
        trigger_id: command.trigger_id,
        view: selectEnvModal()
      });
    } else {
      const cmd = command.text.split(" ");
      const user = command.user_id;
      var msg = "";
      var result = [];
      if (cmd[0] == 'help') {
        result[1] = `/deus lend [env] [app]
  /deus return [env] [app]
  /deus wait [env] [app]
  /deus help
  *Tips* : 私のホーム画面に行くと、使用状況が一つの画面で見れますよ！ :eyes: (Click Me > Click 'Go To App' Menu!)`;
      } else if (cmd[0] == 'setting') {
        if (cmd[1] == 'sub') {
          await client.views.open({
            trigger_id: command.trigger_id,
            view: settingsModal.setSubKeywords()
          });
        } else {
          await client.views.open({
            trigger_id: command.trigger_id,
            view: settingsModal.setKeywords()
          });
        }
      } else {
        const env = guessKeyword(cmd[1]);
        const app = guessKeyword(cmd[2]);
        if (!env || !app) {
          result[1] = '環境名が違います。';
        } else {
          var userData = store.getUserData(global.STORAGE_NAME.ENV_STATS, env, app);
          switch(cmd[0]) {
            case 'lend':
              result = lendEnv(env, app, user);
              break;
            case 'return':
              result = returnEnv(env, app, user);
              break;
            case 'wait':
              result = waitEnv(env, app, user);
              break;
            case 'book':
              //result = bookEnv(env, app, user);
              break;
          }
        }
      }  
      if (result[1]) {
        message.sendEph(client, command.channel_id, user, result[1]);
      } else {
        message.send(client, command.channel_id, result[0]);
      }
    }
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

function lendEnv(env, app, user) {
  var current_user_data = store.getUserData(global.STORAGE_NAME.ENV_STATS, env, app);
  var msg = [];
  if (!current_user_data) {
    if (user != null && store.setUser(global.STORAGE_NAME.ENV_STATS, env, app, { user: user })) {
      msg[0] = `<@${user}>が :tonotan_${env}_${app}:の使用を始めました。`;
    } else
      msg[1] = 'error!';
  } else {
    msg[1] = `${env}-${app} はすでに <@${current_user_data.user}>により使用中です。`;
  }
  return msg;
}

function waitEnv(env, app, user) {
  var current_user_data = store.getUserData(global.STORAGE_NAME.ENV_STATS, env, app);
  var msg = [];
  if (current_user_data) {
    if (user == current_user_data.user) {
      msg[1] = `${env}-${app} はすでにあなたが使っています。`;
    } else {
      var current_waiting_data = store.getUserData(global.STORAGE_NAME.WAITING, env, app)
      var priority = (typeof current_waiting_data === 'undefined') ? 1 : current_waiting_data.length + 1;
      if (store.setUser(global.STORAGE_NAME.WAITING, env, app, { user: user })) {
        msg[0] = `<@${user}>が :tonotan_${env}_${app}: の使用のために待機列に並び初めました。 (${priority}番目のWaiting)`;
      } else {
        msg[1] = 'error';
      }
    }
  } else {
    msg[1] = `${env}-${app} は誰も使っていません。`;
  }
  return msg;
}

function returnEnv(env, app, user) {
  var msg = [];
  var current_user_data = store.getUserData(global.STORAGE_NAME.ENV_STATS, env, app);
  if (current_user_data) {
    if (user == current_user_data.user) {
      store.unsetUser(global.STORAGE_NAME.ENV_STATS, env, app)
      msg[0] = `<@${user}>が:tonotan_${env}_${app}:の使用を解放しました。`;
      var waitingUsers = store.getUserData(global.STORAGE_NAME.WAITING, env, app);
      var targetWaitingUser;
      if (waitingUsers.length) {
        waitingUsers.sort(compare);
        targetWaitingUser = waitingUsers[0];
        store.unsetUser(global.STORAGE_NAME.WAITING, env, app, targetWaitingUser.user);
        store.setUser(global.STORAGE_NAME.ENV_STATS, env, app, { user: targetWaitingUser.user });
        msg[0] += `\n 待機していた <@${targetWaitingUser.user}>により使用中になりました。`;
      }
    } else {
      msg[1] = 'error!';
    }
  } else {
    msg[1] = `${env}-${app} は誰も使っていません。`;
  }
  return msg;
}

app.action("env_selected", async ({ ack, body, context, client }) => {
  await ack();
  try {
    const selectedEnv = body.actions[0].selected_option.value;
    const result = await client.views.update({
      token: context.botToken,
      view_id: body.view.id,
      view: selectActionModal(selectedEnv, body.user.id)
    });
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

app.action("push_lend_button", async ({ ack, action, body, context, client }) => {
  await ack();
  try {
    var [env, app] = action.block_id.split("_");
    var user = body.user.id;
    var resultMessage = lendEnv(env, app, user);
    const result = await client.views.update({
      token: context.botToken,
      view_id: body.view.id,
      view: selectActionModal(env, body.user.id, resultMessage.join(""))
    });
    if (resultMessage[1]) {
      message.sendEph(client, null, user, resultMessage[1]);
    } else {
      message.send(client, null, resultMessage[0]);
    }
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

app.action("push_waiting_button", async ({ ack, action, body, context, client }) => {
  await ack();
  try {
    var [env, app] = action.block_id.split("_");
    var user = body.user.id;
    var resultMessage = waitEnv(env, app, user);
    
    const result = await client.views.update({
      token: context.botToken,
      view_id: body.view.id,
      view: selectActionModal(env, body.user.id, resultMessage.join(""))
    });
    if (resultMessage[1]) {
      message.sendEph(client, null, user, resultMessage[1]);
    } else {
      message.send(client, null, resultMessage[0]);
    }
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

function compare( a, b ) {
  if ( a.start_at < b.start_at ){
    return -1;
  }
  if ( a.start_at > b.start_at ){
    return 1;
  }
  return 0;
}

app.action("push_return_button", async ({ ack, action, body, context, client }) => {
  await ack();
  try {
    var [env, app] = action.block_id.split("_");
    var user = body.user.id;
    var resultMessage = returnEnv(env, app, user);
    const result = await client.views.update({
      token: context.botToken,
      view_id: body.view.id,
      view: selectActionModal(env, body.user.id, resultMessage.join(""))
    });
    if (resultMessage[1]) {
      message.sendEph(client, null, user, resultMessage[1]);
    } else {
      message.send(client, null, resultMessage[0]);
    }
  } catch (e) {
    console.log(e);
    app.error(e);
  }
});

// fril_admin:develop を開発機にデプロイしたで〜 by xxx.xxxx
app.event('message', async ({ event, context }) => {
  try {
    if (event.subtype == 'bot_message'){
      var text = event.attachments ? event.attachments[0].text : event.text;
      var matched = text.match(/fril[_-]([a-z]+):([^ ]+) を開発機に(デプロイしました|デプロイしたで|デプロイします|デプロイすんで).* by (.+)/);
      if (matched){ 
        var [app, branch, status, user] = [matched[1], matched[2], matched[3], matched[4]];
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
      }
    }
  }
  catch (error) {
    console.error(error);
  }
});

app.event('app_home_opened', async ({ event, context, payload }) => {
  const homeView = await appHome.createHome(event.user);
  
  try {
    const result = await app.client.views.publish({
      token: context.botToken,
      user_id: event.user,
      view: homeView
    });
    
  } catch(e) {
    console.log(e);
    app.error(e);
  }
});

// Receive view_submissions
app.view('setting_keyword_modal', async ({ ack, body, context, view }) => {
  await ack();
  
  try {
    for ( const [key, value] of Object.entries(view.state.values) ) {
      var textValue = value.name.value;
      store.setKeywords(global.STORAGE_NAME.KEYWORDS, key, textValue);
    }
  } catch(e) {
    console.log(e);
    app.error(e);
  }
    
});

// Receive view_submissions
app.view('setting_subkeyword_modal', async ({ ack, body, context, view }) => {
  await ack();
  
  try {
    for ( const [key, value] of Object.entries(view.state.values) ) {
      var textValue = value.name.value;
      store.setKeywords(global.STORAGE_NAME.SUB_KEYWORDS, key, textValue);
    }
  } catch(e) {
    console.log(e);
    app.error(e);
  }
    
});

(async () => {
  await app.start(process.env.PORT || 3000);

  console.log('Bolt Tono App Is Running!');
})();
