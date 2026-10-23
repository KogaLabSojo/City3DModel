import {spawn} from "node:child_process"
import path from "node:path"
import {fileURLToPath} from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const image = path.join(root, "public", "image-targets", "arco-17-source.png")
const outDir = path.join(root, "public", "image-targets")

function run(command, args, {input, env} = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      shell: true,
      env: {...process.env, ...env},
      stdio: ["pipe", "inherit", "inherit"],
    })
    if (input) child.stdin.end(input)
    else child.stdin.end()
    child.on("exit", (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} が終了コード ${code} で失敗しました`))
    })
  })
}

await run("python", ["scripts/generate_marker.py"])
await run("npx", ["--yes", "@8thwall/image-target-cli@latest"], {
  env: {OVERWRITE_FILES: "true"},
  input: `${image}\n\n\n${outDir}\narco-17\n`,
})
