import { existsSync } from 'node:fs'
import path from 'node:path'

const phase = process.argv[2] ?? 'all'

const requiredPaths = [
  'src/arkiv/clients.ts',
  'src/arkiv/schema/space.ts',
  'src/arkiv/schema/page.ts',
  'src/arkiv/schema/revision.ts',
  'src/arkiv/schema/link.ts',
  'src/arkiv/schema/presence.ts',
  'src/arkiv/queries/pages.ts',
  'src/arkiv/mutations/pages.ts',
  'src/app/page.tsx',
  'src/app/spaces/[spaceSlug]/page.tsx',
  'src/app/spaces/[spaceSlug]/[pageSlug]/page.tsx',
  'src/app/spaces/[spaceSlug]/[pageSlug]/edit/page.tsx',
  'tests/unit/schema-builders.test.ts',
  'tests/integration/edit-page-mutate.test.ts',
  'tests/e2e/no-wallet-browse.test.tsx'
]

const missing = requiredPaths.filter((filePath) => !existsSync(path.join(process.cwd(), filePath)))

if (missing.length > 0) {
  console.error(`Phase verification failed for ${phase}. Missing files:`)
  for (const file of missing) {
    console.error(`- ${file}`)
  }
  process.exit(1)
}

console.log(`Phase verification (${phase}) passed.`)
