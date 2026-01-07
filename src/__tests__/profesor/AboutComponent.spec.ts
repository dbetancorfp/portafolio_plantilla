// src/__tests__/profesor/AboutComponent.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import AboutComponent from '../../components/AboutComponent.vue' // AJUSTA RUTA

type AboutData = {
  titulo?: string
  resumen?: string
  foto?: { url?: string; alt?: string }
}

type PortfolioData = {
  acercaDeMi?: AboutData | null
}

let mockStore: { data: PortfolioData | null }

/**
 * OJO: debe coincidir EXACTAMENTE con:
 * import { usePortfolioStore } from '../stores/portfolio.js'
 */
vi.mock('../../stores/portfolio.js', () => {
  return {
    usePortfolioStore: () => mockStore,
  }
})

const PrimeStubs = {
  Image: {
    props: {
      src: { type: String, default: '' },
      alt: { type: String, default: '' },
      imageClass: { type: String, default: '' },
      preview: { type: Boolean, default: false },
    },
    template: `
      <img
        data-test="pv-image"
        :src="src"
        :alt="alt"
        :data-image-class="imageClass"
        :data-preview="String(preview)"
      />
    `,
  },
} as const

function mountCmp(): VueWrapper {
  return mount(AboutComponent, {
    global: {
      stubs: PrimeStubs,
    },
  })
}

describe('AboutComponent.vue', () => {
  beforeEach(() => {
    mockStore = { data: null }
  })

  it('no renderiza <section#about> si portfolio.data es null', () => {
    mockStore.data = null
    const wrapper = mountCmp()
    expect(wrapper.find('section#about').exists()).toBe(false)
  })

  it('renderiza <section#about> si portfolio.data existe', () => {
    mockStore.data = { acercaDeMi: { titulo: 'Sobre mí', resumen: '...' } }
    const wrapper = mountCmp()
    expect(wrapper.find('section#about').exists()).toBe(true)
  })

  it('section tiene clases base: surface-0 p-3 w-full', () => {
    mockStore.data = { acercaDeMi: { titulo: 'Sobre mí' } }
    const wrapper = mountCmp()

    const section = wrapper.get('section#about')
    expect(section.classes()).toEqual(expect.arrayContaining(['surface-0', 'p-3', 'w-full']))
  })

  it('renderiza el título desde portfolio.data.acercaDeMi.titulo', () => {
    mockStore.data = { acercaDeMi: { titulo: 'Acerca de mí', resumen: '...' } }
    const wrapper = mountCmp()
    expect(wrapper.get('h1').text()).toContain('Acerca de mí')
  })

  it('el <h1> tiene las clases definidas en template', () => {
    mockStore.data = { acercaDeMi: { titulo: 'Acerca de mí' } }
    const wrapper = mountCmp()

    const h1 = wrapper.get('h1')
    expect(h1.classes()).toEqual(
      expect.arrayContaining(['m-0', 'mb-6', 'text-900', 'text-3xxl', 'font-bold']),
    )
  })

  it('renderiza el grid principal con clase align-items-start', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'Acerca de mí', resumen: 'Texto', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('.grid.align-items-start').exists()).toBe(true)
  })

  it('renderiza columna imagen con clases col-12 md:col-4', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'T', resumen: 'R', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('.col-12.md\\:col-4').exists()).toBe(true)
  })

  it('renderiza columna texto con clases col-12 md:col-8', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'T', resumen: 'Texto', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()
    expect(wrapper.find('.col-12.md\\:col-8').exists()).toBe(true)
  })

  it('renderiza el resumen en <p>', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'T', resumen: 'Mi resumen', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()
    expect(wrapper.get('p').text()).toContain('Mi resumen')
  })

  it('el <p> tiene clases text-justify mt-0 line-height-3', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'T', resumen: 'Mi resumen', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()

    const p = wrapper.get('p')
    expect(p.classes()).toEqual(expect.arrayContaining(['text-justify', 'mt-0', 'line-height-3']))
  })

  it('Image recibe src/alt del store y imageClass + preview', () => {
    mockStore.data = {
      acercaDeMi: {
        titulo: 'Acerca de mí',
        resumen: 'Texto',
        foto: { url: '/img/foto.webp', alt: 'Foto de perfil' },
      },
    }
    const wrapper = mountCmp()

    const img = wrapper.get('[data-test="pv-image"]')
    expect(img.attributes('src')).toBe('/img/foto.webp')
    expect(img.attributes('alt')).toBe('Foto de perfil')
    expect(img.attributes('data-image-class')).toBe('w-full border-round img-doble')
    expect(img.attributes('data-preview')).toBe('true')
  })

  it('si acercaDeMi es undefined, sigue renderizando section (porque portfolio.data existe) y no rompe', () => {
    mockStore.data = { acercaDeMi: undefined }
    const wrapper = mountCmp()

    expect(wrapper.find('section#about').exists()).toBe(true)
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.find('[data-test="pv-image"]').exists()).toBe(true)
  })

  it('si foto es undefined, no rompe y Image recibe src/alt vacíos', () => {
    // ESTE TEST SOLO PASA si arreglas el componente a foto?.url y foto?.alt
    mockStore.data = { acercaDeMi: { titulo: 'T', resumen: 'R', foto: undefined } }
    const wrapper = mountCmp()

    const img = wrapper.get('[data-test="pv-image"]')
    expect(img.attributes('src')).toBe('')
    expect(img.attributes('alt')).toBe('')
  })

  it('mantiene el orden visual: h1 antes que el grid', () => {
    mockStore.data = {
      acercaDeMi: { titulo: 'Titulo', resumen: 'Resumen', foto: { url: 'u', alt: 'a' } },
    }
    const wrapper = mountCmp()

    const section = wrapper.get('section#about')
    const children = section.element.children
    expect(children[0]?.tagName.toLowerCase()).toBe('h1')
    expect((children[1] as HTMLElement)?.className).toContain('grid')
  })

  it('reactividad (estable): si el store cambia, remonte y refleja el nuevo estado', () => {
    mockStore.data = null
    const w1 = mountCmp()
    expect(w1.find('section#about').exists()).toBe(false)

    mockStore.data = {
      acercaDeMi: { titulo: 'Nuevo', resumen: 'Nuevo resumen', foto: { url: 'u2', alt: 'a2' } },
    }
    const w2 = mountCmp()
    expect(w2.find('section#about').exists()).toBe(true)
    expect(w2.get('h1').text()).toContain('Nuevo')
    expect(w2.get('p').text()).toContain('Nuevo resumen')
  })
})
