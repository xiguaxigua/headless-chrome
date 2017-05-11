const exec = require('child_process').exec

function launchHeadlessChrome (url, callback) {
  const CHROME = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome'
  exec(`${CHROME} --headless --disable-gpu --remote-debugging-port=9222 ${url}`, callback);
}

launchHeadlessChrome('https://www.chromestatus.com', (err, stdout, stderr) => {
  console.log('启动成功')
})
