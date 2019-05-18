const runCmd = require('./common').runCmd;

(async () => {
    runCmd('yarn start', __dirname + '/../packages/backend', 'Backend Devserver', true);
    runCmd('yarn start', __dirname + '/../packages/frontend', 'Frontend Devserver', true);
})();