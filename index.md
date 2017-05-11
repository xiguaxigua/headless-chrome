title: headless chrome
transition: fadeIn
theme: moon

[slide]
# headless Chrome
------
* chrome浏览器的无界面形态
* Chrome 57支持在linux上运行，Chrome 59 beta支持在mac上运行
* 现代浏览器是为用户服务，无头浏览器则是为程序服务

[slide]
# 优点
------
* 方便测试web应用，js代码
* 截图，生成PDF
* 爬虫抓取信息
* 相比于PhantomJS(webkit)，SlimerJS(gecko)，TrifleJS(IE)，更加贴近浏览器环境

[slide]
# 开始使用

```bash
alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
```

```bash
chrome --headless --disable-gpu --remote-debugging-port=9222 https://google.com
```

[slide]
# 参数
------
```bash
chrome --headless --disable-gpu --remote-debugging-port=9222 https://google.com
```

* --headless 开启无头模式
* --disable-gpu linux下一般没有gpu，增加预防报错
* --remote-debugging-port 监听端口
* --print-to-pdf 打印网页到pdf
* --screenshot 打印网页截图
* --window-size=1280,1696 设置浏览器大小

[slide]
### 在nodejs环境下使用headless Chrome获取一张网页截图

[slide]
### 创建一个基本环境
```javascript
const { ChromeLauncher } = require('lighthouse/lighthouse-cli/chrome-launcher')

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
launchChrome().then(launcher => { console.log('start') })
```

[slide]
### 获取网页截图

```javascript
const chrome = require('chrome-remote-interface')
const fs = require('fs')
launchChrome().then(launcher => {
  chrome(protocol => {
    const { Page } = protocol
    Page.enable().then(() => {
      // API List: https://chromedevtools.github.io/devtools-protocol
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
```

[slide]
### 设置截图属性

```javascript
const deviceMetrics = {
  width: 1200,
  height: 800,
  deviceScaleFactor: 0,
  mobile: false,
  fitWindow: false
}
const screenshotMetrics = {
  width: deviceMetrics.width,
  height: deviceMetrics.height
}
launchChrome(true).then(launcher => {
  chrome(protocol => {
    const { Emulation, Page } = protocol
    const deviceMetrics = {
      width: 400,
      height: 300,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false
    }
    Page.enable().then(() => {
      Emulation.setDeviceMetricsOverride(deviceMetrics)
      Emulation.setVisibleSize(screenshotMetrics)
    ...
```

[slide]
# chrome 59中提供的其他更新
------
* 检测js，css的使用率
* 全屏截图
* 阻止请求
