/**
 * FormField Molecule
 * Combines Label + Input + Error/Help text
 *
 * Usage:
 * new FormField({
 *   label: 'Email Address',
 *   inputType: 'email',
 *   required: true,
 *   placeholder: 'user@example.com',
 *   helpText: 'We\'ll never share your email',
 *   onChange: (value) => console.log(value)
 * }).render()
 */

export class FormField {
  constructor(options = {}) {
    const {
      label = '',
      inputType = 'text',
      name = '',
      id = '',
      value = '',
      placeholder = '',
      required = false,
      disabled = false,
      readonly = false,
      error = null,
      helpText = '',
      icon = null,
      size = 'md',
      onChange = null,
      onBlur = null,
      onFocus = null,
      className = '',
    } = options;

    this.label = label;
    this.inputType = inputType;
    this.name = name || label.toLowerCase().replace(/\s+/g, '-');
    this.id = id || `${this.name}-field`;
    this.value = value;
    this.placeholder = placeholder;
    this.required = required;
    this.disabled = disabled;
    this.readonly = readonly;
    this.error = error;
    this.helpText = helpText;
    this.icon = icon;
    this.size = size;
    this.onChange = onChange;
    this.onBlur = onBlur;
    this.onFocus = onFocus;
    this.className = className;
  }

  render() {
    const { Label } = require('../atoms/Label.js');
    const { Input } = require('../atoms/Input.js');

    const container = document.createElement('div');
    container.className = `form-field ${this.className}`;
    container.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      width: 100%;
    `;

    // Label
    const label = new Label({
      text: this.label,
      htmlFor: this.id,
      required: this.required,
      size: this.size === 'lg' ? 'base' : 'sm',
    }).render();
    container.appendChild(label);

    // Input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      width: 100%;
    `;

    // Input
    const input = new Input({
      type: this.inputType,
      name: this.name,
      id: this.id,
      value: this.value,
      placeholder: this.placeholder,
      required: this.required,
      disabled: this.disabled || false,
      readonly: this.readonly || false,
      size: this.size,
      state: this.error ? 'error' : 'default',
      icon: this.icon,
      iconPosition: 'left',
      ariaLabel: this.label,
      ariaDescribedBy: this.error ? `${this.id}-error` : this.helpText ? `${this.id}-help` : null,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onFocus: this.onFocus,
    }).render();
    inputWrapper.appendChild(input);

    // Error message
    if (this.error) {
      const errorMsg = document.createElement('p');
      errorMsg.id = `${this.id}-error`;
      errorMsg.className = 'form-field-error';
      errorMsg.textContent = this.error;
      errorMsg.style.cssText = `
        margin: 0;
        color: var(--color-error-500);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-normal);
      `;
      inputWrapper.appendChild(errorMsg);
    }

    // Help text
    if (this.helpText && !this.error) {
      const help = document.createElement('p');
      help.id = `${this.id}-help`;
      help.className = 'form-field-help';
      help.textContent = this.helpText;
      help.style.cssText = `
        margin: 0;
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        line-height: var(--line-height-normal);
      `;
      inputWrapper.appendChild(help);
    }

    container.appendChild(inputWrapper);
    return container;
  }
}

// Add FormField styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      width: 100%;
    }

    .form-field-error {
      margin: 0;
      color: var(--color-error-500);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }

    .form-field-help {
      margin: 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      line-height: var(--line-height-normal);
    }
  `;
  document.head.appendChild(style);
}
