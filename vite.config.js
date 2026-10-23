import {defineConfig} from "vite"
import basicSsl from "@vitejs/plugin-basic-ssl"

const phone = process.env.PHONE === "1"

export default defineConfig({
  base: "./",
  plugins: phone ? [basicSsl()] : [],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
