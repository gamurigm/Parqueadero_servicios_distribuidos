import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StatusBadge from '@/components/common/StatusBadge.vue'

describe('StatusBadge.vue', () => {
  it('renderiza badge verde para estado ACTIVO o DISPONIBLE', () => {
    const wrapper = mount(StatusBadge, {
      props: { estado: 'ACTIVO' },
    })

    expect(wrapper.text()).toBe('Activo')
    expect(wrapper.classes()).toContain('bg-green-100')
  })

  it('renderiza badge rojo para estado OCUPADO', () => {
    const wrapper = mount(StatusBadge, {
      props: { estado: 'OCUPADO' },
    })

    expect(wrapper.text()).toBe('Ocupado')
    expect(wrapper.classes()).toContain('bg-red-100')
  })
})
