import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import CardHabilidades from '../../components/CardHabilidades.vue'

type Skill = {
  nombre: string
  nivel: number
}

type CategoriaHabilidades = {
  nombre: string
  items: Skill[]
}

type Props = {
  item: CategoriaHabilidades
}

/**
 * Stubs PrimeVue:
 * - Card: renderiza slots title/content
 * - Rating: expone modelValue/stars/readonly/cancel en attributes para verificar props
 */
const PrimeStubs = {
  Card: {
    template: `
      <div data-test="card">
        <div data-test="card-title"><slot name="title" /></div>
        <div data-test="card-content"><slot name="content" /></div>
      </div>
    `,
  },
  Rating: {
    props: {
      modelValue: { type: Number, required: true },
      stars: { type: Number, required: true },
      readonly: { type: Boolean, default: false },
      cancel: { type: Boolean, default: true },
    },
    template: `
      <div
        data-test="rating"
        :data-value="String(modelValue)"
        :data-stars="String(stars)"
        :data-readonly="String(readonly)"
        :data-cancel="String(cancel)"
      ></div>
    `,
  },
} as const

function makeItem(overrides: Partial<CategoriaHabilidades> = {}): CategoriaHabilidades {
  return {
    nombre: 'Frontend',
    items: [
      { nombre: 'Vue', nivel: 4 },
      { nombre: 'TypeScript', nivel: 3 },
      { nombre: 'CSS', nivel: 5 },
    ],
    ...overrides,
  }
}

function mountCmp(item: CategoriaHabilidades): VueWrapper {
  const props: Props = { item }
  return mount(CardHabilidades, {
    props,
    global: {
      stubs: PrimeStubs,
    },
  })
}

describe('CardHabilidades .vue', () => {
  it('renderiza wrapper .card-zoom y el Card', () => {
    const wrapper = mountCmp(makeItem())
    expect(wrapper.find('.card-zoom').exists()).toBe(true)
    expect(wrapper.find('[data-test="card"]').exists()).toBe(true)
  })

  it('muestra el nombre de la categoría en el title slot', () => {
    const wrapper = mountCmp(makeItem({ nombre: 'Backend' }))
    expect(wrapper.find('[data-test="card-title"]').text()).toContain('Backend')
  })

  it('renderiza un <ul> con clases esperadas', () => {
    const wrapper = mountCmp(makeItem())
    const ul = wrapper.find('ul')
    expect(ul.exists()).toBe(true)
    expect(ul.classes()).toEqual(expect.arrayContaining(['m-0', 'pl-3', 'text-left']))
  })

  it('renderiza tantos <li> como skills haya en item.items', () => {
    const wrapper = mountCmp(
      makeItem({
        items: [
          { nombre: 'A', nivel: 1 },
          { nombre: 'B', nivel: 2 },
        ],
      }),
    )
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('cada <li> tiene la clase mb-2 (según template)', () => {
    const wrapper = mountCmp(makeItem())
    const lis = wrapper.findAll('li')
    expect(lis.length).toBeGreaterThan(0)
    for (const li of lis) {
      expect(li.classes()).toContain('mb-2')
    }
  })

  it('renderiza el nombre de cada skill', () => {
    const item = makeItem({
      items: [
        { nombre: 'Vue', nivel: 4 },
        { nombre: 'Vitest', nivel: 5 },
      ],
    })
    const wrapper = mountCmp(item)

    const text = wrapper.text()
    expect(text).toContain('Vue')
    expect(text).toContain('Vitest')
  })

  it('renderiza un Rating por cada skill', () => {
    const item = makeItem({
      items: [
        { nombre: 'Vue', nivel: 4 },
        { nombre: 'TS', nivel: 3 },
        { nombre: 'CSS', nivel: 5 },
      ],
    })
    const wrapper = mountCmp(item)
    expect(wrapper.findAll('[data-test="rating"]')).toHaveLength(3)
  })

  it('pasa stars=5 a cada Rating', () => {
    const wrapper = mountCmp(makeItem())
    const ratings = wrapper.findAll('[data-test="rating"]')
    expect(ratings.length).toBeGreaterThan(0)
    for (const r of ratings) {
      expect(r.attributes('data-stars')).toBe('5')
    }
  })

  it('pasa readonly=true y cancel=false a cada Rating', () => {
    const wrapper = mountCmp(makeItem())
    const ratings = wrapper.findAll('[data-test="rating"]')
    for (const r of ratings) {
      expect(r.attributes('data-readonly')).toBe('true')
      expect(r.attributes('data-cancel')).toBe('false')
    }
  })

  it('pasa modelValue=skill.nivel a cada Rating (en el mismo orden que items)', () => {
    const item = makeItem({
      items: [
        { nombre: 'A', nivel: 1 },
        { nombre: 'B', nivel: 3 },
        { nombre: 'C', nivel: 5 },
      ],
    })
    const wrapper = mountCmp(item)
    const ratings = wrapper.findAll('[data-test="rating"]')

    expect(ratings).toHaveLength(3)
    expect(ratings[0].attributes('data-value')).toBe('1')
    expect(ratings[1].attributes('data-value')).toBe('3')
    expect(ratings[2].attributes('data-value')).toBe('5')
  })

  it('cada <li> contiene un contenedor con clases flex align-items-center justify-content-between gap-2', () => {
    const wrapper = mountCmp(makeItem())
    const divs = wrapper.findAll('li > div')
    expect(divs.length).toBeGreaterThan(0)
    for (const d of divs) {
      expect(d.classes()).toEqual(
        expect.arrayContaining(['flex', 'align-items-center', 'justify-content-between', 'gap-2']),
      )
    }
  })

  it('caso borde: items vacío -> no hay <li> ni Rating', () => {
    const wrapper = mountCmp(makeItem({ items: [] }))
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.findAll('[data-test="rating"]')).toHaveLength(0)
  })

  it('reactividad: al cambiar props.item.nombre actualiza el título', async () => {
    const wrapper = mountCmp(makeItem({ nombre: 'Frontend' }))
    expect(wrapper.find('[data-test="card-title"]').text()).toContain('Frontend')

    await wrapper.setProps({ item: makeItem({ nombre: 'DevOps' }) })
    expect(wrapper.find('[data-test="card-title"]').text()).toContain('DevOps')
  })

  it('reactividad: al cambiar props.item.items actualiza número de filas y Ratings', async () => {
    const wrapper = mountCmp(
      makeItem({
        items: [
          { nombre: 'A', nivel: 1 },
          { nombre: 'B', nivel: 2 },
        ],
      }),
    )
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.findAll('[data-test="rating"]')).toHaveLength(2)

    await wrapper.setProps({
      item: makeItem({
        items: [
          { nombre: 'X', nivel: 5 },
          { nombre: 'Y', nivel: 4 },
          { nombre: 'Z', nivel: 3 },
        ],
      }),
    })
    expect(wrapper.findAll('li')).toHaveLength(3)
    expect(wrapper.findAll('[data-test="rating"]')).toHaveLength(3)
    expect(wrapper.text()).toContain('X')
    expect(wrapper.text()).toContain('Y')
    expect(wrapper.text()).toContain('Z')
  })

  it('reactividad: al cambiar el nivel de un skill (via setProps) actualiza modelValue del Rating correspondiente', async () => {
    const wrapper = mountCmp(
      makeItem({
        items: [
          { nombre: 'Vue', nivel: 2 },
          { nombre: 'TS', nivel: 3 },
        ],
      }),
    )

    let ratings = wrapper.findAll('[data-test="rating"]')
    expect(ratings[0].attributes('data-value')).toBe('2')
    expect(ratings[1].attributes('data-value')).toBe('3')

    await wrapper.setProps({
      item: makeItem({
        items: [
          { nombre: 'Vue', nivel: 5 },
          { nombre: 'TS', nivel: 1 },
        ],
      }),
    })

    ratings = wrapper.findAll('[data-test="rating"]')
    expect(ratings[0].attributes('data-value')).toBe('5')
    expect(ratings[1].attributes('data-value')).toBe('1')
  })
})
