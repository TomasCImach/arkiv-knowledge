import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="card stack">
      <h1 className="title">Not found</h1>
      <p className="subtitle">The requested space or page does not exist on Arkiv.</p>
      <Link href="/" className="button secondary">
        Back to spaces
      </Link>
    </div>
  )
}
