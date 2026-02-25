import { describe, expect, it } from 'vitest'
import { buildPageSearchPredicates } from '@/arkiv/queries/pages'

describe('query-first search predicate builder', () => {
  it('includes type, schema, space, status, and token predicates', () => {
    const predicates = buildPageSearchPredicates({
      spaceSlug: 'alpha',
      status: 'published',
      q: 'Arkiv relationships'
    })

    expect(predicates).toHaveLength(5)
    expect(predicates[0]).toEqual({ type: 'eq', key: 'type', value: 'kb.page' })
    expect(predicates[1]).toEqual({ type: 'eq', key: 'schemaVersion', value: '1' })
    expect(predicates[2]).toEqual({ type: 'eq', key: 'spaceSlug', value: 'alpha' })
    expect(predicates[3]).toEqual({ type: 'eq', key: 'status', value: 'published' })
    expect(predicates[4]).toMatchObject({ type: 'or' })
    expect(predicates[4]).toMatchObject({
      predicates: expect.arrayContaining([
        { type: 'eq', key: 'token_0', value: 'arkiv' },
        { type: 'eq', key: 'token_19', value: 'relationships' }
      ])
    })
  })

  it('adds root-only hierarchy predicate when parent mode is root', () => {
    const predicates = buildPageSearchPredicates({
      spaceSlug: 'alpha',
      parentMode: 'root'
    })

    expect(predicates).toEqual(
      expect.arrayContaining([{ type: 'not', key: 'parentPageKey', value: '' }])
    )
  })

  it('adds has-parent hierarchy predicate when parent mode is child', () => {
    const predicates = buildPageSearchPredicates({
      spaceSlug: 'alpha',
      parentMode: 'child'
    })

    expect(predicates).toEqual(
      expect.arrayContaining([{ type: 'neq', key: 'parentPageKey', value: '' }])
    )
  })
})
