## simple example code only: hono.js 
THIS IS A SIMPLE SERVER SIDE APP BUILT WITHN HONO.JS , HONO WEBSOCKET HELPER AND BUN.JS AS ENGINE
IT IS A SIMPLE APP THAT HANDLES A REAL TIME CHAT 
IT ALSO HAS A POST ENDPOINT TO RECEIVE DATA AND PASS IT TO WEBSOCKET 


    //ws = new WebSocket('ws://' + location.host + '/ws?u=' + encodeURIComponent(me))



To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000




----------------------
tsconfig.json
// only if the mian index.js is ts like index.ts
// {
//   "compilerOptions": {
//     "strict": true,
//     "jsx": "react-jsx",
//     "jsxImportSource": "hono/jsx"
//   }
// }