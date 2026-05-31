const authService = require('../modules/auth/auth.service');

(async function(){
  try {
    const result = await authService.signup({ name: 'script test', email: 'script+test@example.com', password: 'P@ssw0rd' });
    console.log('RESULT', result);
  } catch (err) {
    console.error('ERROR', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
