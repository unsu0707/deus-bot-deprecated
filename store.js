const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const global = require('./global');
const adapter = new FileSync('db.json');
const db = low(adapter);


exports.init = () => {
  process.env.TZ = 'Asia/Tokyo';
  var defaultTables = {};
  for ( var key in global.STORAGE_NAME) {
    defaultTables[global.STORAGE_NAME[key]] = [];
  }
  db.defaults(defaultTables)
    .write();
}
/*
  [ {key: "env", keyword: "dev"}, ]
*/

exports.getKeywords = (storage_name, key) => {
  const keywords = db.get(storage_name).filter({ key: key }).value()[0];
  if (keywords) {
    return keywords.keywords;
  } else {
    return null;
  }
}
//takizawa: UMADXE7MH ito: UB37WDLSC, zoe:UMT06KJSK
exports.getKeyFromKeyword = (word) => {
  const keywords = db.get(global.STORAGE_NAME.SUB_KEYWORDS).find({ key: word }).value()
    || db.get(global.STORAGE_NAME.SUB_KEYWORDS).find(subKeyword => (subKeyword.keywords && subKeyword.keywords.split(", ").includes(word)) ).value();
  console.log(`${keywords} ${word}`);
  if (keywords) {
    return keywords.key;
  } else {
    return null;
  }
}

exports.setKeywords = (storage_name, key, keywords) => {
  if (this.getKeywords(storage_name, key)) {
    db.get(storage_name).find({ key: key })
    .assign({ keywords: keywords })
    .write();
  } else {
    db.get(storage_name).push({ key: key, keywords: keywords }).write();
  }
  return true;
}

exports.getUserData = (storage_name, env, app) => {
  let current_stat = db.get(storage_name).filter({ env: env, app: app }).sortBy('start_at').value();
  if (storage_name == global.STORAGE_NAME.ENV_STATS) {
    return current_stat[0];
  }
  return current_stat;
}

exports.isUsing = (storage_name, env, app, user) => {
  var current_stat = db.get(storage_name).find({ env: env, app: app, user: user }).value();
  if (typeof current_stat != "undefined") {
    return true;
  } else {
    return false;
  }
}

exports.getWaitingData = (env, app, user) => {
  var current_stat = db.get(global.STORAGE_NAME.WAITING).find({ env: env, app: app, user: user }).value();
  return current_stat;
}

exports.isValidKeywords = (env, app) => {
  return global.env_keywords.env.includes(env) && global.env_keywords.app.includes(app);
}

exports.getValidKeywords = (env, app) => {
  return `env: ${global.env_keywords.env.join(',')}, app: ${global.env_keywords.app.join(',')}`;
}

exports.setUser = (storage_name, env, app, params) => {
  //let current_stat = db.get(storage_name).find({ env: env, app: app }).value()
  //console.log(current_stat);
  //if (!current_stat) {
    let data = Object.assign({ env: env, app: app, start_at: Date.now(), end_at: null, branch: null }, params);
    db.get(storage_name).push(data).write();
    return true;
  //}
  //return current_stat.user;
}

exports.unsetUser = (storage_name, env, app, user = null) => {
  let query = { env: env, app: app }
  if (user != null) {
    query = Object.assign(query, { user : user });
  }
  db.get(storage_name).remove(query).write();
}

exports.setBranch = (env, app, branch) => {
  console.log(`setBranch called -> ${env}, ${app}, branch: ${branch}`)
  let current_stat = db.get(global.STORAGE_NAME.ENV_STATS).find({ env: env, app: app }).value();
  if (current_stat) {
    console.log(current_stat);
    db.get(global.STORAGE_NAME.ENV_STATS).find({ env: env, app: app })
    .assign({ branch: branch })
    .write();
    return true;
  }
}
