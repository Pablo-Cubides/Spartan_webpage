/**
 * Input Validation and Sanitization for Frontend
 */
import React from 'react';

export const FormValidator = {
  /**
   * Validate email
   */
  email: (email: string): { valid: boolean; error?: string } => {
    const trimmed = email.trim().toLowerCase();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!trimmed) {
      return { valid: false, error: 'Email is required' };
    }
    
    if (!pattern.test(trimmed)) {
      return { valid: false, error: 'Invalid email' };
    }
    
    if (trimmed.length > 254) {
      return { valid: false, error: 'Email too long' };
    }
    
    return { valid: true };
  },

  /**
   * Validate password
   */
  password: (password: string): { valid: boolean; error?: string } => {
    if (!password) {
      return { valid: false, error: 'Password is required' };
    }
    
    if (password.length < 8) {
      return { valid: false, error: 'Minimum 8 characters' };
    }
    
    if (password.length > 128) {
      return { valid: false, error: 'Maximum 128 characters' };
    }
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    
    if (!hasUpper || !hasLower || !hasDigit) {
      return {
        valid: false,
        error: 'Must contain uppercase, lowercase and numbers'
      };
    }
    
    return { valid: true };
  },

  /**
   * Validate username
   */
  username: (username: string): { valid: boolean; error?: string } => {
    const trimmed = username.trim();
    
    if (!trimmed) {
      return { valid: false, error: 'Username is required' };
    }
    
    if (trimmed.length < 3) {
      return { valid: false, error: 'Minimum 3 characters' };
    }
    
    if (trimmed.length > 30) {
      return { valid: false, error: 'Maximum 30 characters' };
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return {
        valid: false,
        error: 'Only letters, numbers, hyphens and underscores'
      };
    }
    
    return { valid: true };
  },

  /**
   * Validate URL
   */
  url: (url: string): { valid: boolean; error?: string } => {
    try {
      new URL(url);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL' };
    }
  },

  /**
   * Validate number
   */
  number: (
    value: string | number,
    min?: number,
    max?: number
  ): { valid: boolean; error?: string } => {
    const num = Number(value);
    
    if (isNaN(num)) {
      return { valid: false, error: 'Must be a number' };
    }
    
    if (min !== undefined && num < min) {
      return { valid: false, error: `Minimum ${min}` };
    }
    
    if (max !== undefined && num > max) {
      return { valid: false, error: `Maximum ${max}` };
    }
    
    return { valid: true };
  },

  /**
   * Validate file
   */
  file: (
    file: File,
    options?: { maxSize?: number; allowedTypes?: string[] }
  ): { valid: boolean; error?: string } => {
    if (!file) {
      return { valid: false, error: 'File required' };
    }

    if (options?.maxSize && file.size > options.maxSize) {
      return {
        valid: false,
        error: `File too large (max ${(options.maxSize / 1024 / 1024).toFixed(2)}MB)`
      };
    }

    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed: ${options.allowedTypes.join(', ')}`
      };
    }

    return { valid: true };
  }
};

/**
 * Sanitize strings
 */
export const Sanitizer = {
  /**
   * Remove dangerous HTML
   */
  html: (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Sanitize simple string
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
   * Remove dangerous special characters
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
 * Custom hook for form validation
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
    // Clear error when user starts typing
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
