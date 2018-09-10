// cht stands for cloud-home-tunnel
// this module provides a tunnel for cloud-home to act with

const express = require('express')
const ax = require('axios')
const md5 = require('md5')
const { spawn } = require('child_process')
const log = console.log
const cors = require('cors')
const bodyParser = require('body-parser')

let __id = 0
function genID(s1, s2) {
  if (s1 === 'RESET') __id = 0
  return md5(s1 + s2 + __id++).slice(-8)
}

module.exports = {
  group: [],
  log: console.log,

  connect(opt, done) {
    let m = this
    let remap = () => {
      let ssh = spawn('ssh', [
        '-R',
        `${opt.id}:80:localhost:${opt.port}`,
        'serveo.net'
      ])
      ssh.stdout.on('data', data => {
        log('[serveo]', data.toString('utf-8'))
      })

      ssh.on('close', data => {
        log('ssh exit, reconnecting...')
        remap()
      })

      // update tunnel information
      ax.post(opt.remoteURI, {
        id: opt.id,
        uri: `http://${opt.id}.serveo.net/option`
      })
        .then(res => {
          m.log('register devicegroup: %j', res.data)
        })
        .catch(err => {
          m.log('register devicegroup failed')
        })
    }
    remap()

    app = express()
    app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
    app.use(bodyParser.json())
    app.use(cors())

    app.post('/option', (req, res) => {
      let reply = m.parseOption(req.body)

      if (!reply) res.status(400).send('failed')
      else res.send(reply)
    })

    app.listen(opt.port, () => {
      m.log(`cloud-home tunnel started on ${opt.port} ...`)

      if (done) done()
    })
  },

  parseOption(opt) {
    let m = this

    switch (opt.action) {
      case 'discovery':
        let devs = []
        for (let type in m.group) {
          for (let id in m.group[type]) {
            let d = m.group[type][id]
            devs.push({
              type: type,
              id: id,
              name: d.name,
              icon:
                'https://github.com/antiwinter/cloud-home-az/raw/master/public/' +
                type +
                '.png',
              state: d.getPower() ? 'on' : 'off'
            })
          }
        }

        opt.reply = devs
        break
      case 'turn-on':
      case 'turn-off':
      case 'query':
        opt.reply = 'n/a'

        let g = m.group[opt.type]
        if (g) {
          let d = g[opt.dev]
          if (d) {
            if (opt.action === 'query') opt.reply = d.getPower() ? 'on' : 'off'
            else {
              d.setPower(opt.action === 'turn-on')
              opt.reply = 'ok'
            }
          }
        }
        break
    }

    return opt.reply
  },

  createGroup(opt, sws) {
    if (!this.group[opt.type]) this.group[opt.type] = {}
    let g = this.group[opt.type]

    sws.map(x => {
      let id = genID('type', x.name)
      g[id] = x
    })

    this.connect(opt)
  }
}
