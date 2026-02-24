import { spawnSync } from 'node:child_process'

const result = spawnSync('pnpm', ['tsx', 'scripts/seed-demo.ts'], {
  stdio: 'inherit'
})

if (result.status !== 0) {
  process.exitCode = result.status ?? 1
}
