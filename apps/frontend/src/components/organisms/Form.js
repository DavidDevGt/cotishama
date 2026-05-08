/**
 * Form Organism
 * Form container with field validation and submission handling
 *
 * Usage:
 * const form = new Form({
 *   title: 'Login',
 *   fields: [
 *     { name: 'email', type: 'email', label: 'Email', required: true },
 *     { name: 'password', type: 'password', label: 'Password', required: true }
 *   ],
 *   onSubmit: (data) => console.log(data)
 * }).render()
 */

export class Form {
  constructor(options = {}) {
    const {
      title = '',
      subtitle = '',
      fields = [],
      submitLabel = 'Submit',
      submitVariant = 'primary',
      cancelLabel = null,
      onSubmit = null,
      onCancel = null,
      onFieldChange = null,
      layout = 'vertical', // vertical, horizontal
      className = '',
      id = null,
    } = options;

    this.title = title;
    this.subtitle = subtitle;
    this.fields = fields;
    this.submitLabel = submitLabel;
    this.submitVariant = submitVariant;
    this.cancelLabel = cancelLabel;
    this.onSubmit = onSubmit;
    this.onCancel = onCancel;
    this.onFieldChange = onFieldChange;
    this.layout = layout;
    this.className = className;
    this.id = id;
    this.formData = {};
    this.fieldElements = {};
    this.errors = {};
  }

  render() {
    const { Card } = require('../molecules/Card.js');
    const { FormField } = require('../molecules/FormField.js');
    const { Button } = require('../atoms/Button.js');

    const card = new Card({
      title: this.title,
      subtitle: this.subtitle,
      padding: 'lg',
      variant: 'outlined',
      className: `form-card ${this.className}`,
      id: this.id,
    }).render();

    // Form element
    const form = document.createElement('form');
    form.className = `form form-${this.layout}`;
    form.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      width: 100%;
    `;

    // Prevent default submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Fields
    this.fields.forEach((fieldConfig) => {
      const formField = new FormField({
        label: fieldConfig.label,
        inputType: fieldConfig.type || 'text',
        name: fieldConfig.name,
        id: fieldConfig.name,
        value: fieldConfig.value || '',
        placeholder: fieldConfig.placeholder,
        required: fieldConfig.required,
        disabled: fieldConfig.disabled,
        helpText: fieldConfig.helpText,
        icon: fieldConfig.icon,
        error: this.errors[fieldConfig.name] || null,
      }).render();

      form.appendChild(formField);
      this.fieldElements[fieldConfig.name] = formField;

      // Track input changes
      const input = formField.querySelector('input');
      if (input) {
        input.addEventListener('change', (e) => {
          this.formData[fieldConfig.name] = e.target.value;
          if (this.onFieldChange) {
            this.onFieldChange(fieldConfig.name, e.target.value);
          }
        });

        input.addEventListener('input', (e) => {
          this.formData[fieldConfig.name] = e.target.value;
        });

        // Validation on blur
        input.addEventListener('blur', () => {
          this.validateField(fieldConfig);
        });
      }
    });

    // Footer with buttons
    const footer = document.createElement('div');
    footer.className = 'form-footer';
    footer.style.cssText = `
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      margin-top: var(--spacing-md);
    `;

    // Cancel button
    if (this.cancelLabel) {
      const cancelBtn = new Button({
        label: this.cancelLabel,
        variant: 'secondary',
        size: 'md',
        onClick: () => {
          if (this.onCancel) {
            this.onCancel();
          }
        },
      }).render();
      footer.appendChild(cancelBtn);
    }

    // Submit button
    const submitBtn = new Button({
      label: this.submitLabel,
      variant: this.submitVariant,
      size: 'md',
      type: 'submit',
    }).render();
    footer.appendChild(submitBtn);

    form.appendChild(footer);

    // Replace card content with form
    card.querySelector('[class="card-content"]').appendChild(form);

    // Store form reference
    card.getFormData = () => this.formData;
    card.setFormData = (data) => {
      this.formData = data;
      this.fields.forEach((field) => {
        const input = card.querySelector(`input[name="${field.name}"]`);
        if (input) {
          input.value = data[field.name] || '';
        }
      });
    };
    card.validate = () => this.validate();
    card.clearErrors = () => {
      this.errors = {};
      this.fields.forEach((field) => {
        const fieldElement = this.fieldElements[field.name];
        if (fieldElement) {
          const errorMsg = fieldElement.querySelector('.form-field-error');
          if (errorMsg) errorMsg.remove();
        }
      });
    };

    return card;
  }

  validateField(fieldConfig) {
    const value = this.formData[fieldConfig.name];
    let error = null;

    // Required validation
    if (fieldConfig.required && !value) {
      error = `${fieldConfig.label} is required`;
    }

    // Email validation
    if (value && fieldConfig.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = 'Invalid email address';
      }
    }

    // Min length validation
    if (value && fieldConfig.minLength && value.length < fieldConfig.minLength) {
      error = `Minimum ${fieldConfig.minLength} characters required`;
    }

    // Max length validation
    if (value && fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
      error = `Maximum ${fieldConfig.maxLength} characters allowed`;
    }

    // Custom validation
    if (fieldConfig.validate && !fieldConfig.validate(value)) {
      error = fieldConfig.validateMessage || `${fieldConfig.label} is invalid`;
    }

    if (error) {
      this.errors[fieldConfig.name] = error;
    } else {
      delete this.errors[fieldConfig.name];
    }

    return !error;
  }

  validate() {
    this.errors = {};

    this.fields.forEach((field) => {
      this.validateField(field);
    });

    return Object.keys(this.errors).length === 0;
  }

  handleSubmit() {
    if (this.validate()) {
      if (this.onSubmit) {
        this.onSubmit(this.formData);
      }
    } else {
      // Show errors
      this.showErrors();
    }
  }

  showErrors() {
    this.fields.forEach((field) => {
      if (this.errors[field.name]) {
        const fieldElement = this.fieldElements[field.name];
        if (fieldElement) {
          // Remove existing error
          const existingError = fieldElement.querySelector('.form-field-error');
          if (existingError) existingError.remove();

          // Add new error
          const errorMsg = document.createElement('p');
          errorMsg.className = 'form-field-error';
          errorMsg.textContent = this.errors[field.name];
          errorMsg.style.cssText = `
            margin: 0;
            color: var(--color-error-500);
            font-size: var(--font-size-sm);
          `;
          fieldElement.appendChild(errorMsg);
        }
      }
    });
  }
}

// Add Form styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .form-card {
      width: 100%;
      max-width: 500px;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      width: 100%;
    }

    .form-vertical .form-field {
      flex-direction: column;
    }

    .form-horizontal {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
    }

    .form-horizontal .form-field:last-child {
      grid-column: 1 / -1;
    }

    .form-footer {
      display: flex;
      gap: var(--spacing-md);
      justify-content: flex-end;
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
      margin-top: var(--spacing-md);
    }

    .form-field-error {
      margin: 0;
      color: var(--color-error-500);
      font-size: var(--font-size-sm);
    }

    @media (max-width: 640px) {
      .form-horizontal {
        grid-template-columns: 1fr;
      }

      .form-horizontal .form-field:last-child {
        grid-column: auto;
      }
    }
  `;
  document.head.appendChild(style);
}
