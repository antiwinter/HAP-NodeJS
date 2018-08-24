const WebSocketClient = require('websocket').client
const md5 = require('md5')

let __id = 0
function genID(s1, s2) {
  if (s1 === 'RESET') __id = 0
  return md5(s1 + s2 + __id++).slice(-8)
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

module.exports = {
  group: [],
  client: new WebSocketClient(),
  url: null,

  connect(url, port, done) {
    let m = this

    m.url = `https://${url}`
    if (port) m.url += `:${port}`

    m.log = function(...msg) {
      console.log('[wss]', ...msg)
    }

    let handlerr = function(err) {
      if (err) m.log('wss error', err.toString())
      else m.log('wss closed, reconnecting in 1s...')

      setTimeout(() => {
        m.client.connect(`wss://${url}:${port}`)
      }, 3000)
    }

    m.client.on('connectFailed', handlerr)

    m.client.on('connect', function(cont) {
      m.log('wss connected')

      m.cont = cont

      cont.on('error', handlerr)
      cont.on('close', handlerr)

      cont.on('message', function(msg) {
        m.parseMessage(msg)
      })
    })

    m.log('connecting to', url)
    m.client.connect(`wss://${url}:${port}`)
    done()
  },

  parseMessage(msg) {
    let m = this

    try {
      if (msg.type !== 'utf8') {
        m.log('received none utf8 message', msg)
        return
      }

      let req = JSON.parse(msg.utf8Data)
      m.log('req:', JSON.stringify(req))

      switch (req.action) {
        case 'discovery':
          let devs = []
          for (let type in m.group) {
            for (let id in m.group[type]) {
              let d = m.group[type][id]
              devs.push({
                type: type,
                id: id,
                name: d.name,
                icon: m.url + '/icons/' + type + '.png',
                state: d.getPower() ? 'on' : 'off'
              })
            }
          }

          req.reply = devs
          break
        case 'turn-on':
        case 'turn-off':
        case 'query':
          req.reply = 'n/a'

          let g = m.group[req.type]
          if (g) {
            let d = g[req.dev]
            if (d) {
              if (req.action === 'query')
                req.reply = d.getPower() ? 'on' : 'off'
              else {
                d.setPower(req.action === 'turn-on')
                req.reply = 'ok'
              }
            }
          }
          break
      }

      let s = JSON.stringify(req)
      m.log('reply:', s)
      m.cont.sendUTF(s)
    } catch (err) {
      m.log('cannot parse:', msg, err.toString())
    }
  },

  createGroup(type, sws) {
    if (!this.group[type]) this.group[type] = {}
    let g = this.group[type]

    sws.map(x => {
      let id = genID('type', x.name)
      g[id] = x
    })
  }
}
