const hap = require('./hap')
const cht = require('./cht')
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

// cloud-home tunnel, support AliGenie & Google home
cht.createGroup(
  {
    type: 'light',
    id: 'fiwof80230lslE',
    port: 51827,
    remoteURI: 'https://cloud-home.azurewebsites.net/api/devgrp'
  },
  sws
)
