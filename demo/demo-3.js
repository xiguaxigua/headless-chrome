const chrome = require('chrome-remote-interface');
const {ChromeLauncher} = require('lighthouse/lighthouse-cli/chrome-launcher');
function onPageLoad(Page) {
  return Page.getAppManifest().then(response => {
    if (!response.url) {
      console.log('Site has no app manifest');
      return;
    }
    console.log('Manifest: ' + response.url);
    console.log(response.data);
  });
}
/**
 * Launches a debugging instance of Chrome on port 9222.
 * @param {boolean=} headless True (default) to launch Chrome in headless mode.
 *     Set to false to launch Chrome normally.
 * @return {Promise<ChromeLauncher>}
 */
function launchChrome(headless = true) {
  const launcher = new ChromeLauncher({
    port: 9222,
    autoSelectChrome: false, // False to manually select which Chrome install.
    additionalFlags: [
      '--window-size=412,732',
      '--disable-gpu',
      headless ? '--headless' : ''
    ]
  });

  return launcher.run().then(() => launcher)
    .catch(err => {
      return launcher.kill().then(() => { // Kill Chrome if there's an error.
        throw err;
      }, console.error);
    });
}

launchChrome(true).then(launcher => {
  chrome(protocol => {
    // Extract the parts of the DevTools protocol we need for the task.
    // See API docs: https://chromedevtools.github.io/devtools-protocol/
    const {Page} = protocol;

    // First, enable the Page domain we're going to use.
     Page.enable().then(() => {
      Page.navigate({url: 'https://www.chromestatus.com/'});

      // Wait for window.onload before doing stuff.
      Page.loadEventFired(() => {
        onPageLoad(Page).then(() => {
          protocol.close();
          launcher.kill(); // Kill Chrome.
        });
      });
    });

  }).on('error', err => {
    throw Error('Cannot connect to Chrome:' + err);
  });
});
