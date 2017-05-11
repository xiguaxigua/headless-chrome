const { ChromeLauncher } = require('lighthouse/lighthouse-cli/chrome-launcher')
const chrome = require('chrome-remote-interface')
const fs = require('fs')
const deviceMetrics = {
  width: 1200,
  height: 600,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false
}
const screenMetrics = {
  width: 1200,
  height: 600
}

function launchChrome () {
  const launcher = new ChromeLauncher({
    port: 9222,
    autoSelectChrome: true,
    additionalFlags: [
      '--window-size=412,732',
      '--disable-gpu',
      '--headless'
    ]
  })
  return launcher.run()
    .then(() => launcher)
    .catch(err => {
      return launcher.kill().then(() => { throw err }, console.error)
    })
}

launchChrome().then(launcher => {
  chrome(protocol => {
    const { Page, Emulation } = protocol
    Page.enable().then(() => {
      // API List: https://chromedevtools.github.io/devtools-protocol
      Emulation.setDeviceMetricsOverride(deviceMetrics)
      Emulation.setVisibleSize(screenMetrics)
      Page.navigate({ url: 'https://www.baidu.com/' })
      Page.loadEventFired(() => {
        const settings = { format: 'jpeg', fromSurface: true }
        const screenshot = Page.captureScreenshot(settings).then(res => {
          const buffer = new Buffer(res.data, 'base64')
          fs.writeFile('output.jpeg', buffer, 'base64', err => {
            if (err) console.log('err')
            protocol.close()
            launcher.kill()
          })
        })
      })
    })
  }).on('error', err => { console.log(err) })
})
