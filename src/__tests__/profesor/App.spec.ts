import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../../App.vue'

describe('App', () => {
  it('mounts renders properly', () => {
    // Stub NavbarComponent to avoid PrimeVue plugin dependency during unit tests
    const wrapper = mount(App, { global: { stubs: ['NavbarComponent'] } })

    // Check that the header (navbar) is present when App is mounted
    expect(wrapper.find('header').exists()).toBe(true)
  })
})
