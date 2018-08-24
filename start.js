const hap = require('./hap')
const vtl = require('./voice-tunnel-client')
const sws = require('./switch').switches

// Home kit in LAN
hap.createBridge(
  {
    name: 'Switch Center',
    mac: 'CC:22:3D:E3:CE:F6',
    port: 51826,
    pincode: '079-34-343'
  },
  sws
)

// get options

const opt = require('minimist')(process.argv.slice(2))

// Voice tunnel, support AliGenie & Google home
vtl.connect(
  opt.server,
  opt.port,
  err => {
    vtl.createGroup('light', sws)
  }
)
