// import the core Hono framework — this is the HTTP router/app
import { Hono } from 'hono'

// upgradeWebSocket: wraps a route handler to perform the WS handshake and gives us onOpen/onMessage/onClose hooks
// websocket: the raw Bun WebSocket handler object — Bun requires it exported so it can manage the WS lifecycle internally
import { upgradeWebSocket, websocket } from 'hono/bun'

// the HTML string for the chat UI — kept in a separate file to avoid cluttering the server logic
import { chathtml } from './html/chathtml'

// create the Hono app instance — this is what handles all incoming HTTP requests
const app = new Hono()

// in-memory Set of all currently open WebSocket connections (WSContext objects from Hono)
// a Set is used instead of an array because it automatically handles uniqueness and O(1) delete
const clients = new Set()

// helper function to send a message to every connected client
// exclude: optionally skip one socket (e.g. the sender) — defaults to null meaning send to everyone
function broadcast(msg, exclude = null) {
  clients.forEach((ws) => {
    // skip the excluded socket if one was provided
    if (ws !== exclude) ws.send(JSON.stringify(msg)) // serialize the object to a JSON string before sending — WebSockets only transport strings or binary
  })
}




// ── UI ────────────────────────────────────────────────────────────────────────
// serve the chat HTML page at the root URL "/"
// c.html() sets the correct Content-Type: text/html header automatically
// chathtml is called as a function because it's an arrow function that returns the HTML string
app.get('/', (c) => c.html(chathtml))




// ── WebSocket ─────────────────────────────────────────────────────────────────

app.get(
  '/ws', // the URL the browser connects to when opening a WebSocket e.g. new WebSocket('ws://host/ws')

  // upgradeWebSocket intercepts this GET request and upgrades it to a WS connection (HTTP 101 Switching Protocols)
  // it receives the Hono context (c) so we can read query params, headers, etc. before the connection is accepted
  upgradeWebSocket((c) => {

    // read the username from the query string e.g. /ws?u=alice
    // falls back to 'anon' if not provided
    const username = c.req.query('u') || 'anon'

    // return an object of event handlers — Hono's WS helper calls these at the right moments
    return {

      // onOpen fires once when the WebSocket connection is successfully established
      // _  : the open event object (unused here, hence the underscore convention)
      // ws : the WSContext object — Hono's wrapper around the raw Bun WebSocket, used to send/close
      onOpen(_, ws) {
        clients.add(ws)                                     // register this connection in our Set so broadcast() can reach it
        broadcast({ sys: true, text: `${username} joined` }) // notify everyone that a new user connected
      },

      // onMessage fires every time this client sends a message through the WebSocket
      // event.data contains the raw string the client sent
      onMessage(event, ws) {
        const text = String(event.data).trim() // coerce to string (could be a Buffer in some runtimes) and strip whitespace
        if (!text) return                      // ignore empty messages — no point broadcasting blank strings
        broadcast({ user: username, text })    // send the message to everyone (including the sender in this case)
      },

      // onClose fires when the client disconnects — either intentionally or due to network loss
      onClose(_, ws) {
        clients.delete(ws)                                  // remove from the Set — this socket is dead, don't try to send to it again
        broadcast({ sys: true, text: `${username} left` }) // notify everyone that this user disconnected
      },
    }
  })
)


app.post('/announce', async (c) => {
  const { text } = await c.req.json()   // read the POST body
  if (!text) return c.json({ ok: false }, 400)

  broadcast({ sys: true, text })        // reuse the same broadcast() — pushes to all connected WS clients

  return c.json({ ok: true })
})



// ── Export (required by Bun's WS helper) ─────────────────────────────────────

// Bun doesn't use a .listen() call like Node — instead you export a default object and Bun reads it
export default {
  fetch: app.fetch,  // fetch: the standard Request → Response handler — all HTTP routes go through this
  websocket,         // websocket: the low-level Bun WS handler imported from hono/bun — without this export Bun has no idea how to handle WS events (onOpen, onMessage, onClose would never fire)
  port: 3000,        // tell Bun which port to listen on
}