import { ref } from 'vue'

export function useFormValidation() {
  const errors = ref({})

  function clearErrors() {
    errors.value = {}
  }

  function setError(field, message) {
    errors.value[field] = message
  }

  function validateRequired(field, value, label = 'Campo') {
    if (value === null || value === undefined || String(value).trim() === '') {
      errors.value[field] = `${label} es requerido.`
      return false
    }
    delete errors.value[field]
    return true
  }

  function validateEmail(field, email) {
    if (!validateRequired(field, email, 'Email')) return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.value[field] = 'Ingrese un correo electrónico válido.'
      return false
    }
    delete errors.value[field]
    return true
  }

  function validateMinLength(field, value, min, label = 'Campo') {
    if (!value || value.length < min) {
      errors.value[field] = `${label} debe tener al menos ${min} caracteres.`
      return false
    }
    delete errors.value[field]
    return true
  }

  function validatePlate(field, plate) {
    if (!validateRequired(field, plate, 'La placa')) return false
    const plateRegex = /^[A-Z0-9-]{3,10}$/i
    if (!plateRegex.test(plate)) {
      errors.value[field] = 'Formato de placa inválido (ej. ABC-1234 o ABC1234).'
      return false
    }
    delete errors.value[field]
    return true
  }

  const hasErrors = () => Object.keys(errors.value).length > 0

  return {
    errors,
    clearErrors,
    setError,
    validateRequired,
    validateEmail,
    validateMinLength,
    validatePlate,
    hasErrors,
  }
}
