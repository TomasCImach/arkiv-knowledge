import { Breadcrumbs } from '@/app/_components/breadcrumbs'
import { CreateSpaceForm } from '@/app/_components/create-space-form'

export const dynamic = 'force-dynamic'

export default function NewSpacePage() {
  return (
    <section className="stack doc-column">
      <Breadcrumbs items={[{ href: '/', label: 'Knowledge Base' }, { label: 'Create Space' }]} />
      <CreateSpaceForm />
    </section>
  )
}
