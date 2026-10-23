import {spawn} from "node:child_process"

const child = spawn("npx", ["vite"], {
  stdio: "inherit",
  shell: true,
  env: {...process.env, PHONE: "1"},
})

child.on("exit", (code) => process.exit(code ?? 0))
