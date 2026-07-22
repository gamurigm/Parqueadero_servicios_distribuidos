import { describe, it, expect } from 'vitest'
import { useFormValidation } from '@/composables/useFormValidation'

describe('useFormValidation', () => {
  it('valida campos requeridos correctamente', () => {
    const val = useFormValidation()

    expect(val.validateRequired('nombre', '', 'Nombre')).toBe(false)
    expect(val.errors.value.nombre).toContain('Nombre es requerido')

    expect(val.validateRequired('nombre', 'Juan', 'Nombre')).toBe(true)
    expect(val.errors.value.nombre).toBeUndefined()
  })

  it('valida formato de correo electrónico', () => {
    const val = useFormValidation()

    expect(val.validateEmail('email', 'correo-invalido')).toBe(false)
    expect(val.errors.value.email).toContain('válido')

    expect(val.validateEmail('email', 'usuario@dominio.com')).toBe(true)
    expect(val.errors.value.email).toBeUndefined()
  })

  it('valida formato de placa de vehículo', () => {
    const val = useFormValidation()

    expect(val.validatePlate('placa', '12')).toBe(false)
    expect(val.validatePlate('placa', 'PBA-1234')).toBe(true)
  })
})
