// src/components/__tests__/CardExperience.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import CardExperience from '../../components/CardExperience.vue'

type ExperienceItem = {
  rol: string
  empresa: string
  ubicacion?: string
  fechaInicio: string
  fechaFin: string | null
  descripcion: string
  logros: string[]
  tecnologias?: string[]
}

type Props = {
  item: ExperienceItem
}

/**
 * Stubs de PrimeVue:
 * - Card: renderiza title/content slots
 * - Tag: renderiza el value para poder testearlo
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
  Tag: {
    props: ['value', 'severity'] as const,
    template: `<span data-test="tag" :data-severity="severity">{{ value }}</span>`,
  },
} as const

function makeItem(overrides: Partial<ExperienceItem> = {}): ExperienceItem {
  return {
    rol: 'Frontend Developer',
    empresa: 'ACME Corp',
    ubicacion: 'Madrid',
    fechaInicio: '01/2024',
    fechaFin: '12/2024',
    descripcion: 'Construí UI y componentes reutilizables.',
    logros: ['Mejoré el rendimiento un 30%', 'Reduje bugs en producción'],
    tecnologias: ['Vue', 'TypeScript', 'PrimeVue'],
    ...overrides,
  }
}

function mountCmp(item: ExperienceItem): VueWrapper {
  const props: Props = { item }
  return mount(CardExperience, {
    props,
    global: {
      stubs: PrimeStubs,
    },
  })
}

describe('CardExperience.vue', () => {
  it('renderiza el wrapper principal y el Card', () => {
    const wrapper = mountCmp(makeItem())
    expect(wrapper.find('.card-zoom').exists()).toBe(true)
    expect(wrapper.find('[data-test="card"]').exists()).toBe(true)
  })

  it('renderiza el rol y la empresa en el título', () => {
    const item = makeItem({ rol: 'Fullstack', empresa: 'Umbrella' })
    const wrapper = mountCmp(item)

    const title = wrapper.find('[data-test="card-title"]').text()
    expect(title).toContain('Fullstack')
    expect(title).toContain('Umbrella')
  })

  it("si hay ubicacion, la muestra precedida por ' · '", () => {
    const item = makeItem({ ubicacion: 'Barcelona' })
    const wrapper = mountCmp(item)

    const title = wrapper.find('[data-test="card-title"]').text()
    expect(title).toContain(' · Barcelona')
  })

  it("si NO hay ubicacion, NO renderiza el separador ' · '", () => {
    const item = makeItem({ ubicacion: undefined })
    const wrapper = mountCmp(item)

    const title = wrapper.find('[data-test="card-title"]').text()
    expect(title).not.toContain(' · ')
  })

  it('renderiza la descripción', () => {
    const item = makeItem({ descripcion: 'Descripción de prueba' })
    const wrapper = mountCmp(item)

    const content = wrapper.find('[data-test="card-content"]').text()
    expect(content).toContain('Descripción de prueba')
  })

  it('calcula rangoFechas: fechaInicio — fechaFin (cuando fechaFin no es null)', () => {
    const item = makeItem({ fechaInicio: '02/2020', fechaFin: '11/2021' })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).toContain('02/2020 — 11/2021')
  })

  it('calcula rangoFechas: fechaInicio — Actualidad (cuando fechaFin es null)', () => {
    const item = makeItem({ fechaInicio: '06/2022', fechaFin: null })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).toContain('06/2022 — Actualidad')
  })

  it("renderiza sección 'Logros' cuando logros tiene elementos", () => {
    const item = makeItem({ logros: ['A', 'B', 'C'] })
    const wrapper = mountCmp(item)

    expect(wrapper.find('h4').text()).toBe('Logros')
    const lis = wrapper.findAll('li')
    expect(lis).toHaveLength(3)
    expect(lis[0].text()).toBe('A')
    expect(lis[1].text()).toBe('B')
    expect(lis[2].text()).toBe('C')
  })

  it("no renderiza sección 'Logros' cuando logros está vacío", () => {
    const item = makeItem({ logros: [] })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).not.toContain('Logros')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it("renderiza sección 'Tecnologías' cuando tecnologias tiene elementos", () => {
    const item = makeItem({ tecnologias: ['Vue', 'TS'] })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).toContain('Tecnologías')
    const tags = wrapper.findAll('[data-test="tag"]')
    expect(tags).toHaveLength(2)
    expect(tags[0].text()).toBe('Vue')
    expect(tags[1].text()).toBe('TS')
  })

  it("no renderiza sección 'Tecnologías' cuando tecnologias es undefined", () => {
    const item = makeItem({ tecnologias: undefined })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).not.toContain('Tecnologías')
    expect(wrapper.findAll('[data-test="tag"]')).toHaveLength(0)
  })

  it("no renderiza sección 'Tecnologías' cuando tecnologias es []", () => {
    const item = makeItem({ tecnologias: [] })
    const wrapper = mountCmp(item)

    expect(wrapper.text()).not.toContain('Tecnologías')
    expect(wrapper.findAll('[data-test="tag"]')).toHaveLength(0)
  })

  it("pasa severity='secondary' a cada Tag", () => {
    const item = makeItem({ tecnologias: ['Vue', 'TypeScript', 'PrimeVue'] })
    const wrapper = mountCmp(item)

    const tags = wrapper.findAll('[data-test="tag"]')
    expect(tags.length).toBeGreaterThan(0)
    for (const t of tags) {
      expect(t.attributes('data-severity')).toBe('secondary')
    }
  })

  it('reacciona a cambios de props (actualiza el texto del rol/empresa)', async () => {
    const wrapper = mountCmp(makeItem({ rol: 'Junior', empresa: 'A' }))

    expect(wrapper.text()).toContain('Junior')
    expect(wrapper.text()).toContain('A')

    await wrapper.setProps({
      item: makeItem({ rol: 'Senior', empresa: 'B' }),
    })

    expect(wrapper.text()).toContain('Senior')
    expect(wrapper.text()).toContain('B')
  })

  it('reacciona a cambios de props (actualiza rangoFechas)', async () => {
    const wrapper = mountCmp(makeItem({ fechaInicio: '01/2020', fechaFin: '01/2021' }))
    expect(wrapper.text()).toContain('01/2020 — 01/2021')

    await wrapper.setProps({
      item: makeItem({ fechaInicio: '03/2021', fechaFin: null }),
    })
    expect(wrapper.text()).toContain('03/2021 — Actualidad')
  })

  it('reacciona a cambios de props (logros pasa de vacío a con elementos)', async () => {
    const wrapper = mountCmp(makeItem({ logros: [] }))
    expect(wrapper.text()).not.toContain('Logros')
    expect(wrapper.findAll('li')).toHaveLength(0)

    await wrapper.setProps({
      item: makeItem({ logros: ['X', 'Y'] }),
    })
    expect(wrapper.text()).toContain('Logros')
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('reacciona a cambios de props (tecnologias pasa a undefined y desaparecen tags)', async () => {
    const wrapper = mountCmp(makeItem({ tecnologias: ['Vue'] }))
    expect(wrapper.findAll('[data-test="tag"]')).toHaveLength(1)

    await wrapper.setProps({
      item: makeItem({ tecnologias: undefined }),
    })
    expect(wrapper.findAll('[data-test="tag"]')).toHaveLength(0)
  })

  it('mantiene la estructura esperada del título: rol en <span> y empresa en <small>', () => {
    const wrapper = mountCmp(makeItem())
    const title = wrapper.find('[data-test="card-title"]')

    // Ojo: con stub de Card, el DOM es el del slot.
    expect(title.find('span').exists()).toBe(true)
    expect(title.find('small').exists()).toBe(true)

    expect(title.find('span').text()).toBe(makeItem().rol)
    expect(title.find('small').text()).toContain(makeItem().empresa)
  })

  it("renderiza la lista de logros con clase 'mb-2' en cada <li> (según template)", () => {
    const wrapper = mountCmp(makeItem({ logros: ['A', 'B'] }))
    const lis = wrapper.findAll('li')

    expect(lis).toHaveLength(2)
    for (const li of lis) {
      expect(li.classes()).toContain('mb-2')
    }
  })
})
