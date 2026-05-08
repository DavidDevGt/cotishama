/**
 * Pagination Molecule
 * Navigation component for paginated content
 *
 * Usage:
 * new Pagination({
 *   currentPage: 1,
 *   totalPages: 10,
 *   onPageChange: (page) => console.log(page),
 *   siblingsCount: 1
 * }).render()
 */

export class Pagination {
  constructor(options = {}) {
    const {
      currentPage = 1,
      totalPages = 1,
      onPageChange = null,
      siblingsCount = 1,
      className = '',
      id = null,
    } = options;

    this.currentPage = currentPage;
    this.totalPages = totalPages;
    this.onPageChange = onPageChange;
    this.siblingsCount = siblingsCount;
    this.className = className;
    this.id = id;
  }

  render() {
    const { Button } = require('../atoms/Button.js');

    const nav = document.createElement('nav');
    nav.className = `pagination ${this.className}`;
    nav.setAttribute('aria-label', 'Pagination');
    nav.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
    `;

    if (this.id) nav.id = this.id;

    const pages = this.getPageNumbers();

    // Previous button
    const prevBtn = new Button({
      label: 'Previous',
      variant: 'secondary',
      size: 'sm',
      disabled: this.currentPage === 1,
      onClick: () => {
        if (this.currentPage > 1 && this.onPageChange) {
          this.onPageChange(this.currentPage - 1);
        }
      },
      ariaLabel: 'Go to previous page',
    }).render();
    nav.appendChild(prevBtn);

    // Page numbers
    pages.forEach((page) => {
      if (page === '...') {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.cssText = `
          padding: var(--spacing-xs) var(--spacing-sm);
          color: var(--color-text-secondary);
        `;
        nav.appendChild(ellipsis);
      } else {
        const pageBtn = new Button({
          label: page.toString(),
          variant: page === this.currentPage ? 'primary' : 'secondary',
          size: 'sm',
          onClick: () => {
            if (page !== this.currentPage && this.onPageChange) {
              this.onPageChange(page);
            }
          },
          ariaLabel: `Go to page ${page}`,
          ariaPressed: page === this.currentPage,
        }).render();
        nav.appendChild(pageBtn);
      }
    });

    // Next button
    const nextBtn = new Button({
      label: 'Next',
      variant: 'secondary',
      size: 'sm',
      disabled: this.currentPage === this.totalPages,
      onClick: () => {
        if (this.currentPage < this.totalPages && this.onPageChange) {
          this.onPageChange(this.currentPage + 1);
        }
      },
      ariaLabel: 'Go to next page',
    }).render();
    nav.appendChild(nextBtn);

    // Info text
    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    info.style.cssText = `
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-left: auto;
    `;
    nav.appendChild(info);

    return nav;
  }

  getPageNumbers() {
    const pages = [];
    const leftSiblingIndex = Math.max(this.currentPage - this.siblingsCount, 1);
    const rightSiblingIndex = Math.min(this.currentPage + this.siblingsCount, this.totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < this.totalPages - 1;

    // Always show page 1
    pages.push(1);

    // Left dots
    if (shouldShowLeftDots) {
      pages.push('...');
    }

    // Left siblings
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      pages.push(i);
    }

    // Right dots
    if (shouldShowRightDots) {
      pages.push('...');
    }

    // Always show last page (if more than 1)
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

    // Remove duplicates
    return [...new Set(pages)];
  }
}

// Add Pagination styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-xs);
      flex-wrap: wrap;
      padding: var(--spacing-md);
    }

    .pagination-info {
      font-size: var(--font-size-sm);
      color: var(--color-text-secondary);
      margin-left: auto;
    }

    @media (max-width: 640px) {
      .pagination {
        gap: var(--spacing-xs);
      }

      .pagination-info {
        margin-left: 0;
        width: 100%;
        text-align: center;
        order: 3;
      }
    }
  `;
  document.head.appendChild(style);
}
