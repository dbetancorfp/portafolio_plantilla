import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'
import CardProjects from '../../components/CardProjects.vue'

const CardStub = {
  name: 'Card',
  setup(_, { slots }) {
    return () => (slots.default ? slots.default() : null)
  },
}

const ButtonStub = {
  name: 'Button',
  props: ['label', 'as', 'href'],
  setup(props) {
    return () =>
      props.as === 'a' ? h('a', { href: props.href }, props.label) : h('button', props.label)
  },
}

describe('CardProjects', () => {
  it('renders project info and action buttons', () => {
    const item = {
      nombre: 'Project X',
      descripcion: 'A cool project',
      links: { demo: 'https://demo', repo: 'https://repo' },
    }

    const wrapper = mount(CardProjects, {
      props: { item },
      global: { components: { Card: CardStub, Button: ButtonStub } },
    })

    expect(wrapper.text()).toContain('Project X')
    expect(wrapper.text()).toContain('A cool project')

    // Buttons should be present with labels
    expect(wrapper.findAll('a').some((a) => a.text() === 'Demo')).toBe(true)
    expect(wrapper.findAll('button').some((b) => b.text() === 'Repo')).toBe(false)
  })
})
