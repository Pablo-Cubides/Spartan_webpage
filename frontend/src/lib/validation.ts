/**
 * Input Validation y Sanitización para Frontend
 */
import React from 'react';

export const FormValidator = {
  /**
   * Validar email
   */
  email: (email: string): { valid: boolean; error?: string } => {
    const trimmed = email.trim().toLowerCase();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!trimmed) {
      return { valid: false, error: 'El email es requerido' };
    }
    
    if (!pattern.test(trimmed)) {
      return { valid: false, error: 'Email inválido' };
    }
    
    if (trimmed.length > 254) {
      return { valid: false, error: 'Email demasiado largo' };
    }
    
    return { valid: true };
  },

  /**
   * Validar contraseña
   */
  password: (password: string): { valid: boolean; error?: string } => {
    if (!password) {
      return { valid: false, error: 'La contraseña es requerida' };
    }
    
    if (password.length < 8) {
      return { valid: false, error: 'Mínimo 8 caracteres' };
    }
    
    if (password.length > 128) {
      return { valid: false, error: 'Máximo 128 caracteres' };
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    
    if (!hasUpper || !hasLower || !hasDigit) {
      return {
        valid: false,
        error: 'Debe contener mayúsculas, minúsculas y números'
      };
    }
    
    return { valid: true };
  },

  /**
   * Validar username
   */
  username: (username: string): { valid: boolean; error?: string } => {
    const trimmed = username.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'El usuario es requerido' };
    }
    
    if (trimmed.length < 3) {
      return { valid: false, error: 'Mínimo 3 caracteres' };
    }
    
    if (trimmed.length > 30) {
      return { valid: false, error: 'Máximo 30 caracteres' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        valid: false,
        error: 'Solo letras, números, guiones y guiones bajos'
      };
    }
    
    return { valid: true };
  },

  /**
   * Validar URL
   */
  url: (url: string): { valid: boolean; error?: string } => {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'URL inválida' };
    }
  },

  /**
   * Validar número
   */
  number: (
    value: string | number,
    min?: number,
    max?: number
  ): { valid: boolean; error?: string } => {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Debe ser un número' };
    }
    
    if (min !== undefined && num < min) {
      return { valid: false, error: `Mínimo ${min}` };
    }
    
    if (max !== undefined && num > max) {
      return { valid: false, error: `Máximo ${max}` };
    }
    
    return { valid: true };
  },

  /**
   * Validar archivo
   */
  file: (
    file: File,
    options?: { maxSize?: number; allowedTypes?: string[] }
  ): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'Archivo requerido' };
    }

    if (options?.maxSize && file.size > options.maxSize) {
      return {
        valid: false,
        error: `Archivo demasiado grande (máx ${(options.maxSize / 1024 / 1024).toFixed(2)}MB)`
      };
    }

    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de archivo no permitido. Permitidos: ${options.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }
};

/**
 * Sanitizar strings
 */
export const Sanitizer = {
  /**
   * Remover HTML peligroso
   */
  html: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Sanitizar string simple
   */
  text: (text: string, maxLength?: number): string => {
    let result = text.trim();
    
    // Remover caracteres de control
    result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    if (maxLength && result.length > maxLength) {
      result = result.substring(0, maxLength);
    }
    
    return result;
  },

  /**
   * Remover caracteres especiales peligrosos
   */
  alphanum: (text: string): string => {
    return text.replace(/[^a-zA-Z0-9_-]/g, '');
  }
};

interface FormState {
  [key: string]: string | number | boolean;
}

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

/**
 * Hook personalizado para validación de formularios
 */
export const useFormValidation = (
  initialState: FormState,
  onSubmit: (values: FormState) => Promise<void>
) => {
  const [values, setValues] = React.useState(initialState);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<FormTouched>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(values);
    } catch (error: unknown) {
      if (error instanceof Error && 'fieldErrors' in error) {
        const typedError = error as Error & { fieldErrors: FormErrors };
        setErrors(typedError.fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    values,
    errors,
    touched,
    isLoading,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors
  };
};
