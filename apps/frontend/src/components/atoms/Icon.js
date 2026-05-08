/**
 * Icon Component
 * SVG icon wrapper with support for multiple icon libraries
 *
 * Usage:
 * new Icon({
 *   name: 'search',
 *   size: 'md',
 *   color: 'primary',
 *   ariaLabel: 'Search'
 * }).render()
 */

export class Icon {
  constructor(options = {}) {
    const {
      name = 'circle',
      size = 'md', // xs, sm, md, lg, xl
      color = 'primary',
      className = '',
      id = null,
      ariaLabel = null,
      ariaHidden = true,
      viewBox = '0 0 24 24',
      strokeWidth = 2,
    } = options;

    this.name = name;
    this.size = size;
    this.color = color;
    this.className = className;
    this.id = id;
    this.ariaLabel = ariaLabel;
    this.ariaHidden = ariaHidden;
    this.viewBox = viewBox;
    this.strokeWidth = strokeWidth;
  }

  render() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', this.viewBox);
    svg.setAttribute('width', this.getSize());
    svg.setAttribute('height', this.getSize());
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', this.strokeWidth);
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    svg.classList.add('icon', `icon-${this.size}`, `icon-${this.color}`, this.className);
    svg.style.cssText = this.getStyles();

    if (this.id) svg.id = this.id;
    if (this.ariaHidden) svg.setAttribute('aria-hidden', 'true');
    if (this.ariaLabel && !this.ariaHidden) {
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', this.ariaLabel);
    }

    const path = this.getIconPath();
    svg.appendChild(path);

    return svg;
  }

  getSize() {
    const sizes = {
      xs: '16',
      sm: '20',
      md: '24',
      lg: '32',
      xl: '48',
    };
    return sizes[this.size] || sizes.md;
  }

  getStyles() {
    const colorMap = {
      primary: 'var(--color-primary-500)',
      secondary: 'var(--color-text-secondary)',
      success: 'var(--color-success-500)',
      error: 'var(--color-error-500)',
      warning: 'var(--color-warning-500)',
      white: 'white',
    };

    return `
      color: ${colorMap[this.color] || colorMap.primary};
      display: inline-block;
      flex-shrink: 0;
    `.trim();
  }

  getIconPath() {
    const paths = {
      search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      menu: 'M4 6h16M4 12h16M4 18h16',
      close: 'M6 18L18 6M6 6l12 12',
      check: 'M5 13l4 4L19 7',
      chevron_right: 'M9 5l7 7-7 7',
      chevron_left: 'M15 19l-7-7 7-7',
      chevron_down: 'M19 9l-7 7-7-7',
      chevron_up: 'M19 15l-7-7-7 7',
      arrow_right: 'M5 12h14M12 5l7 7-7 7',
      arrow_left: 'M19 12H5M12 19l-7-7 7-7',
      plus: 'M12 5v14m-7-7h14',
      minus: 'M5 12h14',
      edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-4l8.5-8.5a2.12 2.12 0 013 3L12 16.5',
      trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3',
      download: 'M12 2v12m0 0l-4-4m4 4l4-4M4 14h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1z',
      upload: 'M12 16v-8m0 0L8 12m4-4l4 4M4 10h16a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4a1 1 0 011-1z',
      alert: 'M12 9v2m0 4v2m7.2-12.6l-8.4-2.4a1 1 0 00-.8 0l-8.4 2.4a1 1 0 00-.6.9v10.2a1 1 0 00.6.9l8.4 2.4a1 1 0 00.8 0l8.4-2.4a1 1 0 00.6-.9V9.3a1 1 0 00-.6-.9z',
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      help: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      user: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm-1.998 4c1.331-1.502 2.236-3.301 2.236-5a6 6 0 00-12 0c0 1.699.905 3.498 2.236 5h7.528z',
      users: 'M17 20h5v-2a3 3 0 00-5.856-1.487M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zM5 20a7 7 0 1110-9.999',
      circle: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z',
      lock: 'M12 2C10.34 2 9 3.34 9 5v3H5c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3v-8c0-1.66-1.34-3-3-3h-4V5c0-1.66-1.34-3-3-3zm0 2c.55 0 1 .45 1 1v3h-2V5c0-.55.45-1 1-1zm-8 6h14v8H4v-8z',
      unlock: 'M12 2C10.34 2 9 3.34 9 5v3H5c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3v-8c0-1.66-1.34-3-3-3h-4V9c0-1.66-1.34-3-3-3zm0 2c.55 0 1 .45 1 1v3h-2V5c0-.55.45-1 1-1zm-8 6h14v8H4v-8z',
    };

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const d = paths[this.name] || paths.circle;
    path.setAttribute('d', d);

    return path;
  }
}
