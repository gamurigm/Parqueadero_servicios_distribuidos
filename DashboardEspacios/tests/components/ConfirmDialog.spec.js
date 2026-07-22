import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

describe('ConfirmDialog.vue', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renderiza título y mensaje cuando visible es true', () => {
    mount(ConfirmDialog, {
      props: {
        visible: true,
        titulo: 'Eliminar Registro',
        mensaje: '¿Desea proceder?',
      },
      attachTo: document.body,
    })

    expect(document.body.textContent).toContain('Eliminar Registro')
    expect(document.body.textContent).toContain('¿Desea proceder?')
  })

  it('emite eventos confirm y cancel al hacer click en botones', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        visible: true,
      },
      attachTo: document.body,
    })

    const buttons = document.querySelectorAll('button')
    expect(buttons.length).toBe(2)

    buttons[0].click()
    expect(wrapper.emitted('cancel')).toBeTruthy()

    buttons[1].click()
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })
})
