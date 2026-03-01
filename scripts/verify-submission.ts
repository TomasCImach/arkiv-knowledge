import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const requiredFiles = [
  'README.md',
  'SUBMISSION_EVIDENCE.md',
  'scripts/capture-evidence.ts',
  'public/submission/home.png',
  'public/submission/space.png',
  'public/submission/page.png',
  'public/submission/settings.png'
]

const missingFiles = requiredFiles.filter((filePath) => !existsSync(path.join(root, filePath)))
if (missingFiles.length > 0) {
  console.error('Submission verification failed. Missing required files:')
  for (const file of missingFiles) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

const readme = readFileSync(path.join(root, 'README.md'), 'utf8')
const requiredReadmeSections = [
  /^## Team Members$/m,
  /^## Deployed Demo URL$/m,
  /^## Architecture Diagram$/m,
  /^## Judge Screenshots$/m
]

const missingSections = requiredReadmeSections.filter((pattern) => !pattern.test(readme))
if (missingSections.length > 0) {
  console.error('Submission verification failed. README is missing required sections.')
  process.exit(1)
}

const requiredScreenshotRefs = [
  'public/submission/home.png',
  'public/submission/space.png',
  'public/submission/page.png',
  'public/submission/settings.png'
]
const missingScreenshotRefs = requiredScreenshotRefs.filter((reference) => !readme.includes(reference))
if (missingScreenshotRefs.length > 0) {
  console.error('Submission verification failed. README is missing screenshot references:')
  for (const reference of missingScreenshotRefs) {
    console.error(`- ${reference}`)
  }
  process.exit(1)
}

const captureScript = readFileSync(path.join(root, 'scripts/capture-evidence.ts'), 'utf8')
if (!captureScript.includes('video-start') || !captureScript.includes('MANIFEST.sha256')) {
  console.error('Submission verification failed. capture-evidence script must produce clip + hash manifest artifacts.')
  process.exit(1)
}

console.log('Submission verification passed.')
