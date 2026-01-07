// src/__tests__/HabilidadesComponent.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import HabilidadesComponent from '../../components/HabilidadesComponent.vue' // AJUSTA RUTA

/**
 * Tipos mínimos para test
 */
type Skill = { nombre: string; nivel: number }
type CategoriaHabilidades = { nombre: string; items: Skill[] }
type HabilidadesBlock = { titulo: string; categorias: CategoriaHabilidades[] }
type PortfolioData = { habilidades?: HabilidadesBlock | null }

/**
 * Mock store Pinia: usePortfolioStore()
 * Ojo: la ruta debe coincidir EXACTAMENTE con el import del componente:
 * import { usePortfolioStore } from '../stores/portfolio'
 */
let mockStore: { data: PortfolioData | null }

vi.mock('../../stores/portfolio', () => {
  return {
    usePortfolioStore: () => mockStore,
  }
})

/**
 * Stub del hijo CardHabilidades
 */
const CardHabilidadesStub = {
  name: 'CardHabilidades',
  props: {
    item: { type: Object, required: true },
  },
  template: `<div data-test="card-habilidades">{{ item.nombre }}|{{ item.items.length }}</div>`,
} as const

function makeCategoria(overrides: Partial<CategoriaHabilidades> = {}): CategoriaHabilidades {
  return {
    nombre: 'Frontend',
    items: [
      { nombre: 'Vue', nivel: 4 },
      { nombre: 'TypeScript', nivel: 3 },
    ],
    ...overrides,
  }
}

function mountCmp(): VueWrapper {
  return mount(HabilidadesComponent, {
    global: {
      stubs: {
        CardHabilidades: CardHabilidadesStub,
      },
    },
  })
}

describe('HabilidadesComponent.vue', () => {
  beforeEach(() => {
    mockStore = { data: null }
  })

  it('no renderiza <section#skills> si portfolio.data es null', () => {
    mockStore.data = null
    const wrapper = mountCmp()
    expect(wrapper.find('section#skills').exists()).toBe(false)
  })

  it('no renderiza <section#skills> si habilidades es null', () => {
    mockStore.data = { habilidades: null }
    const wrapper = mountCmp()
    expect(wrapper.find('section#skills').exists()).toBe(false)
  })

  it('no renderiza <section#skills> si categorias no existe o está vacío', () => {
    mockStore.data = {
      habilidades: { titulo: 'Habilidades', categorias: [] },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('section#skills').exists()).toBe(false)
  })

  it('renderiza <section#skills> si categorias tiene al menos 1 elemento', () => {
    mockStore.data = {
      habilidades: { titulo: 'Habilidades', categorias: [makeCategoria()] },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('section#skills').exists()).toBe(true)
  })

  it('renderiza el título skills.titulo en el <h1>', () => {
    mockStore.data = {
      habilidades: { titulo: 'Mis habilidades', categorias: [makeCategoria()] },
    }
    const wrapper = mountCmp()
    expect(wrapper.get('h1').text()).toBe('Mis habilidades')
  })

  it('renderiza un contenedor .grid', () => {
    mockStore.data = {
      habilidades: { titulo: 'Habilidades', categorias: [makeCategoria()] },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('.grid').exists()).toBe(true)
  })

  it('renderiza tantas columnas como categorias, con clases col-12 md:col-6 lg:col-4', () => {
    mockStore.data = {
      habilidades: {
        titulo: 'Habilidades',
        categorias: [
          makeCategoria({ nombre: 'Frontend' }),
          makeCategoria({ nombre: 'Backend' }),
          makeCategoria({ nombre: 'DevOps' }),
        ],
      },
    }
    const wrapper = mountCmp()

    const cols = wrapper.findAll('.grid > div')
    expect(cols).toHaveLength(3)

    for (const col of cols) {
      expect(col.classes()).toEqual(expect.arrayContaining(['col-12', 'md:col-6', 'lg:col-4']))
    }
  })

  it('renderiza un CardHabilidades por cada categoría', () => {
    mockStore.data = {
      habilidades: {
        titulo: 'Habilidades',
        categorias: [makeCategoria({ nombre: 'A' }), makeCategoria({ nombre: 'B' })],
      },
    }
    const wrapper = mountCmp()
    expect(wrapper.findAll('[data-test="card-habilidades"]')).toHaveLength(2)
  })

  it('CardHabilidades recibe item correcto (verificación por salida del stub)', () => {
    mockStore.data = {
      habilidades: {
        titulo: 'Habilidades',
        categorias: [makeCategoria({ nombre: 'Frontend', items: [{ nombre: 'Vue', nivel: 4 }] })],
      },
    }
    const wrapper = mountCmp()
    expect(wrapper.get('[data-test="card-habilidades"]').text()).toBe('Frontend|1')
  })

  it('mantiene el orden de render de las categorías', () => {
    mockStore.data = {
      habilidades: {
        titulo: 'Habilidades',
        categorias: [
          makeCategoria({ nombre: 'Primera', items: [] }),
          makeCategoria({ nombre: 'Segunda', items: [{ nombre: 'X', nivel: 1 }] }),
          makeCategoria({
            nombre: 'Tercera',
            items: [
              { nombre: 'Y', nivel: 2 },
              { nombre: 'Z', nivel: 3 },
            ],
          }),
        ],
      },
    }
    const wrapper = mountCmp()

    const cards = wrapper.findAll('[data-test="card-habilidades"]')
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toBe('Primera|0')
    expect(cards[1].text()).toBe('Segunda|1')
    expect(cards[2].text()).toBe('Tercera|2')
  })

  it('soporta categorías con items vacíos sin romper', () => {
    mockStore.data = {
      habilidades: {
        titulo: 'Habilidades',
        categorias: [makeCategoria({ nombre: 'SinItems', items: [] })],
      },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('section#skills').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="card-habilidades"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('SinItems')
  })

  it('reactividad (estable): si el store cambia, remonte y refleja el nuevo estado', () => {
    mockStore.data = { habilidades: { titulo: 'Habilidades', categorias: [] } }
    const w1 = mountCmp()
    expect(w1.find('section#skills').exists()).toBe(false)

    mockStore.data = { habilidades: { titulo: 'Habilidades', categorias: [makeCategoria()] } }
    const w2 = mountCmp()
    expect(w2.find('section#skills').exists()).toBe(true)
  })
})
