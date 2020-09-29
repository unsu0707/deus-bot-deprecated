module.exports = {
  env_keywords: { env: ['dev', 'stg', 'stgqa01'], app: ['web', 'api', 'admin', 'webview', 'transaction'] },
  ENV_SUB_KEYWORDS: {
    env: {
      dev: ['d', 'dev'], stg: ['s', 'stg'], stgqa01: ['q', 'qa', 'qa01', 'stgqa01', 'q1']
    },
    app: {
      web: ['wb', 'web', 'fril_web'],
      api: ['ap', 'api', 'fril_api'],
      admin: ['ad', 'adm', 'admin', 'fril-admin'],
      webview: ['wv', 'webview', 'fril_webview'],
      transaction: ['tr', 'transaction', 'fril_transaction'],
    }
  },
  APP_NAME: 'DEUS',
  STORAGE_NAME: { KEYWORDS: 'keywords', SUB_KEYWORDS: 'sub_keywords', ENV_STATS: 'env_stats', WAITING: 'env_wait_stats', BOOK: 'env_book_stats' },
  STATUS_CHANNEL_ID: 'C2YSQEABH',
  sampleDate: function sampleDate(date, format) {
    format = format.replace(/YYYY/, date.getFullYear());
    format = format.replace(/MM/, ("0" + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/, ("0" + date.getDate()).slice(-2));
    format = format.replace(/HH/, ("0" + date.getHours()).slice(-2));
    format = format.replace(/mm/, ("0" + date.getMinutes()).slice(-2));
 
    return format;
  },
};


