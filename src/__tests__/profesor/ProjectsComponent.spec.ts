// src/__tests__/ProjectsComponent.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import ProjectsComponent from '../../components/ProjectsComponent.vue' // AJUSTA RUTA

/**
 * Tipos mínimos para test (no hace falta clavar el modelo real)
 */
type Proyecto = { nombre?: string; titulo?: string; id?: string }
type ProyectosBlock = { titulo: string; items: Proyecto[] }
type PortfolioData = { proyectos?: ProyectosBlock | null }

/**
 * Mock store Pinia.
 * En tu componente:
 *   import { usePortfolioStore } from '@/stores/portfolio'
 * Así que el mock debe ser EXACTAMENTE ese specifier.
 */
let mockStore: { data: PortfolioData | null }

vi.mock('@/stores/portfolio', () => {
  return {
    usePortfolioStore: () => mockStore,
  }
})

/**
 * Stub hijo CardProjects: valida props por salida.
 */
const CardProjectsStub = {
  name: 'CardProjects',
  props: {
    item: { type: Object, required: true },
  },
  template: `<div data-test="card-projects">{{ item.nombre ?? item.titulo ?? item.id ?? 'project' }}</div>`,
} as const

function makeProject(overrides: Partial<Proyecto> = {}): Proyecto {
  return { nombre: 'Proyecto A', ...overrides }
}

function mountCmp(): VueWrapper {
  return mount(ProjectsComponent, {
    global: {
      stubs: {
        CardProjects: CardProjectsStub,
      },
    },
  })
}

describe('ProjectsComponent.vue', () => {
  beforeEach(() => {
    mockStore = { data: null }
  })

  it('no renderiza <section#projects> si portfolio.data es null', () => {
    mockStore.data = null
    const wrapper = mountCmp()
    expect(wrapper.find('section#projects').exists()).toBe(false)
  })

  it('no renderiza <section#projects> si proyectos es null', () => {
    mockStore.data = { proyectos: null }
    const wrapper = mountCmp()
    expect(wrapper.find('section#projects').exists()).toBe(false)
  })

  it('no renderiza <section#projects> si items está vacío', () => {
    mockStore.data = { proyectos: { titulo: 'Proyectos', items: [] } }
    const wrapper = mountCmp()
    expect(wrapper.find('section#projects').exists()).toBe(false)
  })

  it('renderiza <section#projects> si items tiene al menos 1 elemento', () => {
    mockStore.data = { proyectos: { titulo: 'Proyectos', items: [makeProject()] } }
    const wrapper = mountCmp()
    expect(wrapper.find('section#projects').exists()).toBe(true)
  })

  it('renderiza el título projects.titulo en el <h1>', () => {
    mockStore.data = { proyectos: { titulo: 'Mis Proyectos', items: [makeProject()] } }
    const wrapper = mountCmp()
    expect(wrapper.get('h1').text()).toBe('Mis Proyectos')
  })

  it('renderiza un contenedor .grid', () => {
    mockStore.data = { proyectos: { titulo: 'Proyectos', items: [makeProject()] } }
    const wrapper = mountCmp()
    expect(wrapper.find('.grid').exists()).toBe(true)
  })

  it('renderiza tantas columnas como items, con clases col-12 md:col-6 lg:col-4', () => {
    mockStore.data = {
      proyectos: {
        titulo: 'Proyectos',
        items: [
          makeProject({ nombre: 'A' }),
          makeProject({ nombre: 'B' }),
          makeProject({ nombre: 'C' }),
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

  it('renderiza un CardProjects por cada proyecto', () => {
    mockStore.data = {
      proyectos: {
        titulo: 'Proyectos',
        items: [makeProject({ nombre: 'A' }), makeProject({ nombre: 'B' })],
      },
    }
    const wrapper = mountCmp()
    expect(wrapper.findAll('[data-test="card-projects"]')).toHaveLength(2)
  })

  it('CardProjects recibe item correcto (verificado por el texto del stub)', () => {
    mockStore.data = {
      proyectos: { titulo: 'Proyectos', items: [makeProject({ nombre: 'Umbrella' })] },
    }
    const wrapper = mountCmp()
    expect(wrapper.get('[data-test="card-projects"]').text()).toBe('Umbrella')
  })

  it('mantiene el orden de render de items', () => {
    mockStore.data = {
      proyectos: {
        titulo: 'Proyectos',
        items: [
          makeProject({ nombre: 'Primero' }),
          makeProject({ nombre: 'Segundo' }),
          makeProject({ nombre: 'Tercero' }),
        ],
      },
    }
    const wrapper = mountCmp()
    const cards = wrapper.findAll('[data-test="card-projects"]')
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toBe('Primero')
    expect(cards[1].text()).toBe('Segundo')
    expect(cards[2].text()).toBe('Tercero')
  })

  it('soporta items con campos no estándar (usa fallback id/titulo)', () => {
    mockStore.data = {
      proyectos: {
        titulo: 'Proyectos',
        items: [{ id: 'p1' }, { titulo: 'T2' }, { nombre: 'N3' }],
      },
    }
    const wrapper = mountCmp()
    const cards = wrapper.findAll('[data-test="card-projects"]')
    expect(cards).toHaveLength(3)
    expect(cards[0].text()).toBe('p1')
    expect(cards[1].text()).toBe('T2')
    expect(cards[2].text()).toBe('N3')
  })

  it('reactividad (estable): si cambia el store, remonte y refleja el nuevo estado', () => {
    mockStore.data = { proyectos: { titulo: 'Proyectos', items: [] } }
    const w1 = mountCmp()
    expect(w1.find('section#projects').exists()).toBe(false)

    mockStore.data = {
      proyectos: { titulo: 'Proyectos', items: [makeProject({ nombre: 'Nuevo' })] },
    }
    const w2 = mountCmp()
    expect(w2.find('section#projects').exists()).toBe(true)
    expect(w2.get('h1').text()).toBe('Proyectos')
    expect(w2.get('[data-test="card-projects"]').text()).toBe('Nuevo')
  })
})
