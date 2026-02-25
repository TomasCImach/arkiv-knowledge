import Link from 'next/link'

export type BreadcrumbItem = {
  href?: string
  label: string
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="breadcrumb-item">
          {item.href ? (
            <Link href={item.href} className="breadcrumb-link">
              {item.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
          {index < items.length - 1 ? <span className="breadcrumb-separator">/</span> : null}
        </span>
      ))}
    </nav>
  )
}
