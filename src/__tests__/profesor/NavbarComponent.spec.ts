import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import NavbarComponent from '../../components/NavbarComponent.vue'

interface MenuItem {
  label: string
  [key: string]: unknown
}

interface NavbarComponentInstance {
  items: MenuItem[]
}

// Stub that simulates PrimeVue Menubar rendering and invokes the parent-provided "item" and "start" slots
const MenubarStub = {
  name: 'Menubar',
  props: ['model'],
  setup(props, { slots }) {
    return () =>
      h('nav', [
        // render the start slot if provided
        slots.start ? slots.start() : null,
        // for each model item, invoke the scoped "item" slot so the parent template is used
        ...(props.model || []).map((item: MenuItem) => {
          return slots.item
            ? slots.item({ item, props: { action: {} }, hasSubmenu: false })
            : h('div', item.label)
        }),
      ])
  },
}

// Minimal router-link stub that provides { href, navigate } to the custom slot
const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  setup(props, { slots }) {
    const href = typeof props.to === 'string' ? props.to : (props.to?.path ?? '#')
    const navigate = () => {}
    return () => (slots.default ? slots.default({ href, navigate }) : null)
  },
}

describe('NavbarComponent', () => {
  it('exposes menu items and renders them', () => {
    const wrapper = mount(NavbarComponent, {
      global: {
        components: {
          Menubar: MenubarStub,
          'router-link': RouterLinkStub,
        },
        directives: {
          // stub ripple directive used in template
          ripple: () => {},
        },
      },
    })

    // Check component data
    const vmItems = (wrapper.vm as NavbarComponentInstance).items
    expect(Array.isArray(vmItems)).toBe(true)
    expect(vmItems.length).toBeGreaterThanOrEqual(5)
    expect(vmItems.map((i: MenuItem) => i.label)).toEqual([
      'Sobre mi',
      'Proyectos',
      'Habilidades',
      'Experiencia',
      'Contacto',
    ])

    // Check rendered labels exist in DOM
    const text = wrapper.text()
    expect(text).toContain('Portafolio')
    expect(text).toContain('Sobre mi')
    expect(text).toContain('Proyectos')
    expect(text).toContain('Contacto')

    // Ensure links produced by the router-link slot contain the expected hrefs
    const anchors = wrapper.findAll('a')
    // There should be at least as many anchors as items
    expect(anchors.length).toBeGreaterThanOrEqual(5)
    // Check first anchor href is the /aboutme route
    expect(anchors[0].attributes('href')).toBe('/aboutme')
  })
})
