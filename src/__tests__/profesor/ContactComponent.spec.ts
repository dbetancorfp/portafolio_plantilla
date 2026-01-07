// src/__tests__/profesor/ContactComponent.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { VueWrapper } from '@vue/test-utils'
import ContactComponent from '../../components/ContactComponent.vue'

/**
 * Mock del JSON de privacidad (AJUSTA la ruta para que sea EXACTAMENTE
 * la misma que usa tu componente en el import)
 *
 * En tu componente: import privacy from '../data/politica-privacidad.json'
 * Así que el mock debe apuntar a esa ruta RELATIVA desde ESTE TEST.
 */
vi.mock('../../data/politica-privacidad.json', () => {
  return {
    default: {
      titulo: 'Política de privacidad',
      version: '1.0',
      fechaActualizacion: '2026-01-01',
      responsable: { nombre: 'ACME', email: 'privacidad@acme.test' },
      finalidad: ['Responder consultas', 'Soporte'],
      baseJuridica: ['Consentimiento'],
      datosTratados: ['Nombre', 'Email', 'Mensaje'],
      conservacion: ['12 meses'],
      destinatarios: ['No se ceden'],
      derechos: ['Acceso', 'Rectificación', 'Supresión'],
      medidasSeguridad: ['Cifrado', 'Control de acceso'],
      observaciones: ['Texto adicional'],
    },
  }
})

/**
 * Mock de useToast()
 */
type ToastPayload = {
  severity: 'success' | 'info' | 'warn' | 'error'
  summary?: string
  detail?: string
  life?: number
}

const toastAdd = vi.fn<(payload: ToastPayload) => void>()

vi.mock('primevue/usetoast', () => {
  return {
    useToast: () => ({
      add: toastAdd,
    }),
  }
})

/**
 * Stubs PrimeVue (SIN 'as' dentro de templates)
 */
const PrimeStubs = {
  IftaLabel: { template: '<div data-test="iftalabel"><slot /></div>' },

  InputText: {
    props: {
      modelValue: { type: String, default: '' },
      invalid: { type: Boolean, default: false },
      id: { type: String, default: '' },
      type: { type: String, default: 'text' },
      placeholder: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :data-invalid="String(invalid)"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    `,
  },

  Textarea: {
    props: {
      modelValue: { type: String, default: '' },
      invalid: { type: Boolean, default: false },
      id: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      rows: { type: [Number, String], default: 3 },
      autoResize: { type: Boolean, default: false },
    },
    emits: ['update:modelValue'],
    template: `
      <textarea
        :id="id"
        :placeholder="placeholder"
        :rows="rows"
        :data-invalid="String(invalid)"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      ></textarea>
    `,
  },

  Dropdown: {
    props: {
      modelValue: { type: String, default: '' }, // guardamos value string
      options: { type: Array, default: () => [] },
      optionLabel: { type: String, default: 'label' },
      optionValue: { type: String, default: 'value' },
      id: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      invalid: { type: Boolean, default: false },
    },
    emits: ['update:modelValue'],
    template: `
      <select
        :id="id"
        :data-invalid="String(invalid)"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="(o, i) in options" :key="i" :value="o[optionValue]">
          {{ o[optionLabel] }}
        </option>
      </select>
    `,
  },

  SelectButton: {
    props: {
      modelValue: { type: String, default: '' },
      options: { type: Array, default: () => [] },
      optionLabel: { type: String, default: 'label' },
      optionValue: { type: String, default: 'value' },
      id: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <div :id="id" data-test="selectbutton">
        <button
          v-for="(o, i) in options"
          :key="i"
          type="button"
          @click="$emit('update:modelValue', o[optionValue])"
        >
          {{ o[optionLabel] }}
        </button>
      </div>
    `,
  },

  Checkbox: {
    props: {
      modelValue: { type: Boolean, default: false },
      binary: { type: Boolean, default: false },
      inputId: { type: String, default: '' },
    },
    emits: ['update:modelValue'],
    template: `
      <input
        :id="inputId"
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', $event.target.checked)"
      />
    `,
  },

  Button: {
    props: {
      type: { type: String, default: 'button' },
      label: { type: String, default: '' },
    },
    emits: ['click'],
    template: `<button :type="type" @click="$emit('click')">{{ label }}</button>`,
  },

  Toast: { template: `<div data-test="toast"></div>` },

  Dialog: {
    props: {
      visible: { type: Boolean, default: false },
      header: { type: String, default: '' },
      modal: { type: Boolean, default: false },
      style: { type: Object, default: () => ({}) },
    },
    emits: ['update:visible'],
    template: `
      <div v-if="visible" data-test="dialog">
        <div data-test="dialog-header">{{ header }}</div>
        <button type="button" data-test="dialog-close" @click="$emit('update:visible', false)">close</button>
        <div data-test="dialog-body"><slot /></div>
      </div>
    `,
  },
} as const

function mountContact(): VueWrapper {
  return mount(ContactComponent, {
    global: {
      stubs: PrimeStubs,
    },
  })
}

async function fillValidForm(
  wrapper: VueWrapper,
  overrides?: Partial<{
    nombre: string
    email: string
    asunto: string
    mensaje: string
    acepta: boolean
    prioridadClickLabel: 'Baja' | 'Media' | 'Alta'
  }>,
) {
  const nombre = overrides?.nombre ?? 'David'
  const email = overrides?.email ?? 'david@example.com'
  const asunto = overrides?.asunto ?? 'general'
  const mensaje = overrides?.mensaje ?? 'Mensaje válido con más de 10 caracteres.'
  const acepta = overrides?.acepta ?? true
  const prioridadClickLabel = overrides?.prioridadClickLabel ?? 'Media'

  await wrapper.get('#name').setValue(nombre)
  await wrapper.get('#email').setValue(email)
  await wrapper.get('#subject').setValue(asunto)
  await wrapper.get('#message').setValue(mensaje)
  if (acepta) await wrapper.get('#privacy').setValue(true)

  const prioBtn = wrapper
    .findAll('[data-test="selectbutton"] button')
    .find((b) => b.text() === prioridadClickLabel)
  if (prioBtn) await prioBtn.trigger('click')
}

describe('ContactComponent.vue', () => {
  beforeEach(() => {
    toastAdd.mockClear()
  })

  it('renderiza estructura básica: section, h1, form y Toast', () => {
    const wrapper = mountContact()
    expect(wrapper.find('section#contact').exists()).toBe(true)
    expect(wrapper.find('h1').text()).toBe('Contacto')
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('[data-test="toast"]').exists()).toBe(true)
  })

  it('renderiza 4 IftaLabel (Nombre, Email, Asunto, Mensaje)', () => {
    const wrapper = mountContact()
    expect(wrapper.findAll('[data-test="iftalabel"]')).toHaveLength(4)
  })

  it('por defecto: no muestra errores ni dialog', () => {
    const wrapper = mountContact()
    expect(wrapper.findAll('small.p-error')).toHaveLength(0)
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(false)
  })

  it('al enviar vacío: aparecen todos los errores de validación', async () => {
    const wrapper = mountContact()
    await wrapper.get('form').trigger('submit')

    const text = wrapper.text()
    expect(text).toContain('El nombre es obligatorio.')
    expect(text).toContain('Introduce un email válido.')
    expect(text).toContain('Selecciona un asunto.')
    expect(text).toContain('El mensaje debe tener al menos 10 caracteres.')
    expect(text).toContain('Debes aceptar la política de privacidad.')
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('marca invalid en inputs cuando submitted=true y el campo no cumple', async () => {
    const wrapper = mountContact()
    await wrapper.get('form').trigger('submit')

    expect(wrapper.get('#name').attributes('data-invalid')).toBe('true')
    expect(wrapper.get('#email').attributes('data-invalid')).toBe('true')
    expect(wrapper.get('#subject').attributes('data-invalid')).toBe('true')
    expect(wrapper.get('#message').attributes('data-invalid')).toBe('true')
  })

  it('email inválido: muestra error de email y no envía', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper, { email: 'no-es-email' })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Introduce un email válido.')
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('mensaje < 10 caracteres: muestra error y no envía', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper, { mensaje: '123456789' })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('El mensaje debe tener al menos 10 caracteres.')
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('no acepta privacidad: muestra error y no envía', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper, { acepta: false })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Debes aceptar la política de privacidad.')
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('asunto vacío: muestra error y no envía', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper)
    await wrapper.get('#subject').setValue('') // placeholder

    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Selecciona un asunto.')
    expect(toastAdd).not.toHaveBeenCalled()
  })

  it('v-model.trim: nombre y email con espacios pasan (email sin espacios tras trim)', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper, {
      nombre: '   David   ',
      email: '   david@example.com   ',
    })

    await wrapper.get('form').trigger('submit')
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('envío válido: llama toast.add con payload esperado', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')

    expect(toastAdd).toHaveBeenCalledTimes(1)
    const payload = toastAdd.mock.calls[0]?.[0]
    expect(payload?.severity).toBe('success')
    expect(payload?.summary).toBe('Enviado')
    expect(payload?.detail).toBe('Tu mensaje se ha enviado correctamente.')
    expect(payload?.life).toBe(3000)
  })

  it('envío válido: resetea campos principales', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper)

    await wrapper.get('form').trigger('submit')

    expect((wrapper.get('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#email').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#subject').element as HTMLSelectElement).value).toBe('')
    expect((wrapper.get('#message').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.get('#privacy').element as HTMLInputElement).checked).toBe(false)
  })

  it('botón Limpiar: resetea campos', async () => {
    const wrapper = mountContact()
    await fillValidForm(wrapper)

    const limpiar = wrapper.findAll('button').find((b) => b.text() === 'Limpiar')
    expect(limpiar).toBeTruthy()
    await limpiar!.trigger('click')

    expect((wrapper.get('#name').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#email').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#subject').element as HTMLSelectElement).value).toBe('')
    expect((wrapper.get('#message').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.get('#privacy').element as HTMLInputElement).checked).toBe(false)
  })

  it("link 'política de privacidad' abre el diálogo", async () => {
    const wrapper = mountContact()
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(false)

    await wrapper.get('a.p-link').trigger('click')
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(true)
  })

  it('diálogo: muestra el header desde privacy.titulo', async () => {
    const wrapper = mountContact()
    await wrapper.get('a.p-link').trigger('click')
    expect(wrapper.get('[data-test="dialog-header"]').text()).toBe('Política de privacidad')
  })

  it('diálogo: renderiza bloques y listas', async () => {
    const wrapper = mountContact()
    await wrapper.get('a.p-link').trigger('click')

    const bodyText = wrapper.get('[data-test="dialog-body"]').text()
    expect(bodyText).toContain('Versión 1.0')
    expect(bodyText).toContain('Actualizada: 2026-01-01')
    expect(bodyText).toContain('Responsable:')
    expect(bodyText).toContain('ACME')
    expect(bodyText).toContain('privacidad@acme.test')
    expect(bodyText).toContain('Finalidad')
    expect(bodyText).toContain('Responder consultas')
    expect(bodyText).toContain('Soporte')
    expect(bodyText).toContain('Base jurídica')
    expect(bodyText).toContain('Consentimiento')
    expect(bodyText).toContain('Datos tratados')
    expect(bodyText).toContain('Nombre')
    expect(bodyText).toContain('Email')
    expect(bodyText).toContain('Mensaje')
    expect(bodyText).toContain('Conservación')
    expect(bodyText).toContain('12 meses')
    expect(bodyText).toContain('Destinatarios')
    expect(bodyText).toContain('No se ceden')
    expect(bodyText).toContain('Derechos')
    expect(bodyText).toContain('Acceso')
    expect(bodyText).toContain('Rectificación')
    expect(bodyText).toContain('Supresión')
    expect(bodyText).toContain('Medidas de seguridad')
    expect(bodyText).toContain('Cifrado')
    expect(bodyText).toContain('Control de acceso')
  })

  it('diálogo: muestra Observaciones si existen', async () => {
    const wrapper = mountContact()
    await wrapper.get('a.p-link').trigger('click')
    expect(wrapper.text()).toContain('Observaciones')
    expect(wrapper.text()).toContain('Texto adicional')
  })

  it('diálogo: se cierra cuando Dialog emite update:visible=false', async () => {
    const wrapper = mountContact()
    await wrapper.get('a.p-link').trigger('click')
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(true)

    await wrapper.get('[data-test="dialog-close"]').trigger('click')
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(false)
  })

  it('tras submit inválido, corregir y reenviar: termina enviando', async () => {
    const wrapper = mountContact()

    await wrapper.get('form').trigger('submit')
    expect(toastAdd).not.toHaveBeenCalled()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    expect(toastAdd).toHaveBeenCalledTimes(1)
  })

  it('dos submits válidos seguidos llaman toast 2 veces', async () => {
    const wrapper = mountContact()

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    expect(toastAdd).toHaveBeenCalledTimes(1)

    await fillValidForm(wrapper)
    await wrapper.get('form').trigger('submit')
    expect(toastAdd).toHaveBeenCalledTimes(2)
  })
})
