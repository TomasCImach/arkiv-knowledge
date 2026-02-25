import { existsSync } from 'node:fs'
import path from 'node:path'

const requiredPaths = [
  'PLAN.md',
  'EXPLANATIONS.md',
  'ITERATION_LOG.md',
  'DEMO_SCRIPT.md',
  'SUBMISSION_EVIDENCE.md',
  'scripts/capture-evidence.ts'
]

const missing = requiredPaths.filter((filePath) => !existsSync(path.join(process.cwd(), filePath)))

if (missing.length > 0) {
  console.error('Evidence verification failed. Missing required files:')
  for (const file of missing) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

console.log('Evidence verification passed.')
