// src/__tests__/Error404Component.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Error404Component from '../../components/Error404Component.vue'

describe('Error404Component.vue', () => {
  it('renderiza un <section>', () => {
    const wrapper = mount(Error404Component)
    expect(wrapper.find('section').exists()).toBe(true)
  })

  it('renderiza el título <h1> con el texto exacto', () => {
    const wrapper = mount(Error404Component)
    const h1 = wrapper.get('h1')
    expect(h1.text()).toBe('Página no encontrada')
  })

  it('solo contiene un h1', () => {
    const wrapper = mount(Error404Component)
    expect(wrapper.findAll('h1')).toHaveLength(1)
  })

  it('no renderiza formularios ni enlaces (smoke de estructura mínima)', () => {
    const wrapper = mount(Error404Component)
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('snapshot (opcional): estructura estable', () => {
    const wrapper = mount(Error404Component)
    const html = wrapper.html().replace(/\s+/g, ' ').trim()
    expect(html).toMatchInlineSnapshot(`"<section> <h1>Página no encontrada</h1> </section>"`)
  })
})
