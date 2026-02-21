export const chathtml = `
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>chat</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: monospace; font-size: 13px; background: #0f0f0f; color: #ccc; height: 100dvh; display: flex; flex-direction: column; }
    #log  { flex: 1; overflow-y: auto; padding: 10px 14px; display: flex; flex-direction: column; gap: 3px; }
    .m .u { color: #6ee7a0; margin-right: 6px; }
    .s    { color: #3a3a3a; font-style: italic; }
    #bar  { display: flex; border-top: 1px solid #222; }
    #bar input  { flex: 1; background: #0f0f0f; border: none; color: #ccc; padding: 10px 14px; font-family: monospace; font-size: 13px; outline: none; }
    #bar button { background: #222; color: #ccc; border: none; border-left: 1px solid #333; padding: 10px 16px; font-family: monospace; cursor: pointer; }
    #gate { position: fixed; inset: 0; background: #0f0f0f; display: flex; gap: 0; border-bottom: 1px solid #222; height: 37px; }
    #gate input  { flex: 1; background: #0f0f0f; border: none; color: #ccc; padding: 10px 14px; font-family: monospace; font-size: 13px; outline: none; }
    #gate button { background: #222; color: #ccc; border: none; border-left: 1px solid #333; padding: 10px 16px; font-family: monospace; cursor: pointer; }
  </style>
</head>
<body>

<div id="gate">
  <input id="uname" placeholder="username..." autofocus maxlength="20" />
  <button onclick="join()">join</button>
</div>

<div id="log"></div>
<div id="bar" style="display:none">
  <input id="msg" placeholder="message..." maxlength="400" />
  <button onclick="send()">send</button>
</div>

<script>
  let ws, me

  function join() {
    const v = document.getElementById('uname').value.trim()
    if (!v) return
    me = v
    document.getElementById('gate').remove()
    document.getElementById('bar').style.display = 'flex'

// ws = new WebSocket('ws://' + location.host + '/ws?u=' + encodeURIComponent(me))

    ws = new WebSocket('wss://' + 'bunserver-hono-l4tdaq-8970ec-170-75-162-158.traefik.me' + '/ws?u=' + encodeURIComponent(me))

    ws.onmessage = ({ data }) => {
      const { user, text, sys } = JSON.parse(data)
      const d = document.createElement('div')
      d.className = sys ? 's' : 'm'
      d.innerHTML = sys ? text : '<span class="u">' + user + '</span>' + text
      const log = document.getElementById('log')
      log.appendChild(d)
      log.scrollTop = log.scrollHeight
    }
    document.getElementById('msg').addEventListener('keydown', e => e.key === 'Enter' && send())
    document.getElementById('msg').focus()
  }

  function send() {
    const el = document.getElementById('msg')
    const t = el.value.trim()
    if (!t) return
    ws.send(t)
    el.value = ''
  }
</script>
</body>
</html>`;





// ws = new WebSocket('ws://' + location.host + '/ws?u=' + encodeURIComponent(me))


// ws = new WebSocket('ws://' + 'bunserver-hono-l4tdaq-8970ec-170-75-162-158.traefik.me' + '/ws?u=' + encodeURIComponent(me))



