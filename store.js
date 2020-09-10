const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);
const env_keywords = { env: ['dev', 'stg', 'stgqa01'], app: ['web', 'api', 'admin', 'webview', 'tr'] };

exports.init = () => {
  console.log('db init');
  db.defaults({ env_keywords: env_keywords, env_stats: [] })
    .write();
  const db_env_keywords = db.get('env_keywords').value();
  if (env_keywords.env.join(",") != db_env_keywords.env.join(",") || env_keywords.app.join(",") != db_env_keywords.app.join(",")) {
    console.log('env_keywords has been changed!');
    db.set('env_keywords', env_keywords).write();
  }
}

exports.getEnvKeywords = () => {
  return env_keywords;
}

exports.isValidKeywords = (env, app) => {
  return env_keywords.env.includes(env) && env_keywords.app.includes(app);
}

exports.getValidKeywords = (env, app) => {
  return `env: ${env_keywords.env.join(',')}, app: ${env_keywords.app.join(',')}`;
}

exports.setUser = (env, app, user_id) => {
  let current_stat = db.get('env_stats').find({ env: env, app: app }).value()
  console.log(current_stat);
  if (!current_stat) {
    db.get('env_stats').push({ env: env, app: app, user: user_id, started_at: Date.now(), branch: null })
      .write();
    return true;
  }
  return current_stat.user;
}

exports.unsetUser = (env, app) => {
  db.get('env_stats').remove({ env: env, app: app }).write();
}

exports.getUserData = (env, app) => {
  let current_stat = db.get('env_stats').find({ env: env, app: app }).value();
  if (current_stat) {
    return [current_stat.user, current_stat.started_at, current_stat.branch];
  }
}

exports.setBranch = (env, app, branch) => {
  console.log(`setBranch called -> ${env}, ${app}, branch: ${branch}`)
  let current_stat = db.get('env_stats').find({ env: env, app: app }).value();
  if (current_stat) {
    console.log(current_stat);
    db.get('env_stats').find({ env: env, app: app })
    .assign({ branch: branch })
    .write();
    return true;
  }
}


/*

// Set some defaults (required if your JSON file is empty)
db.defaults({ env_keywords: { env: ['unsu', 'tono'], app: ['web', 'api'] }, env_stat: {} })
  .write()

// Add a post
db.get('posts')
  .push({ id: 1, title: 'lowdb is awesome'})
  .write()

// Set a user using Lodash shorthand syntax
db.set('user.name', 'typicode')
  .write()
  
// Increment count
db.update('count', n => n + 1)
  .write()
  
*/