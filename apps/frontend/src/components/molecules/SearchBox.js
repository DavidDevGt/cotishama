/**
 * SearchBox Molecule
 * Input with search icon, suggestions, and keyboard navigation
 *
 * Usage:
 * new SearchBox({
 *   placeholder: 'Search products...',
 *   onSearch: (query) => console.log(query),
 *   suggestions: ['Product 1', 'Product 2'],
 *   onSelect: (item) => console.log(item)
 * }).render()
 */

export class SearchBox {
  constructor(options = {}) {
    const {
      placeholder = "Search...",
      value = "",
      size = "md",
      onSearch = null,
      onSelect = null,
      onChange = null,
      suggestions = [],
      debounceMs = 300,
      minChars = 1,
      className = "",
      id = null,
    } = options;

    this.placeholder = placeholder;
    this.value = value;
    this.size = size;
    this.onSearch = onSearch;
    this.onSelect = onSelect;
    this.onChange = onChange;
    this.suggestions = suggestions;
    this.debounceMs = debounceMs;
    this.minChars = minChars;
    this.className = className;
    this.id = id;
    this.debounceTimer = null;
    this.selectedIndex = -1;
  }

  render() {
    const { Input } = require("../atoms/Input.js");

    const container = document.createElement("div");
    container.className = `search-box ${this.className}`;
    container.style.cssText = `
      position: relative;
      width: 100%;
    `;

    if (this.id) container.id = this.id;

    // Input field
    const input = new Input({
      type: "search",
      placeholder: this.placeholder,
      value: this.value,
      size: this.size,
      icon: "search",
      iconPosition: "left",
      autoComplete: "off",
      onKeyDown: (e) => this.handleKeyDown(e, input),
      onChange: (e) => this.handleChange(e, input),
    }).render();

    container.appendChild(input);

    // Suggestions dropdown
    const dropdown = document.createElement("ul");
    dropdown.className = "search-suggestions";
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: var(--spacing-xs);
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      max-height: 300px;
      overflow-y: auto;
      list-style: none;
      padding: 0;
      display: none;
      z-index: var(--z-dropdown);
      box-shadow: var(--shadow-md);
    `;
    dropdown.setAttribute("role", "listbox");
    dropdown.setAttribute("aria-label", "Search suggestions");

    container.appendChild(dropdown);

    // Store references
    container.input = input.querySelector("input") || input;
    container.dropdown = dropdown;
    container.updateSuggestions = (suggestions) => {
      this.suggestions = suggestions;
      this.renderSuggestions(dropdown, container.input);
    };

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        dropdown.style.display = "none";
      }
    });

    return container;
  }

  handleKeyDown(e, input) {
    const dropdown = input.parentElement.querySelector(".search-suggestions");
    const items = dropdown.querySelectorAll('[role="option"]');

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
        this.highlightItem(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.highlightItem(items);
        break;

      case "Enter":
        e.preventDefault();
        if (this.selectedIndex >= 0) {
          const selected = items[this.selectedIndex];
          this.selectItem(selected, input, dropdown);
        } else if (this.onSearch) {
          this.onSearch(input.value);
        }
        break;

      case "Escape":
        e.preventDefault();
        dropdown.style.display = "none";
        this.selectedIndex = -1;
        break;
    }
  }

  handleChange(e, input) {
    const value = input.value;
    this.value = value;

    if (this.onChange) {
      this.onChange(value);
    }

    // Clear debounce timer
    clearTimeout(this.debounceTimer);

    const dropdown = input.parentElement.querySelector(".search-suggestions");

    if (value.length < this.minChars) {
      dropdown.style.display = "none";
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.renderSuggestions(dropdown, input);
      dropdown.style.display = this.suggestions.length > 0 ? "block" : "none";

      if (this.onSearch) {
        this.onSearch(value);
      }
    }, this.debounceMs);
  }

  renderSuggestions(dropdown, input) {
    dropdown.innerHTML = "";
    this.selectedIndex = -1;

    this.suggestions.forEach((suggestion, index) => {
      const li = document.createElement("li");
      li.className = "search-suggestion-item";
      li.setAttribute("role", "option");
      li.textContent = suggestion;
      li.style.cssText = `
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        border-bottom: 1px solid var(--color-border);
      `;

      li.addEventListener("click", () => {
        this.selectItem(li, input, dropdown);
      });

      li.addEventListener("mouseenter", () => {
        this.selectedIndex = index;
        this.highlightItem(dropdown.querySelectorAll('[role="option"]'));
      });

      dropdown.appendChild(li);
    });
  }

  highlightItem(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.style.backgroundColor = "var(--color-surface)";
        item.setAttribute("aria-selected", "true");
      } else {
        item.style.backgroundColor = "transparent";
        item.setAttribute("aria-selected", "false");
      }
    });
  }

  selectItem(item, input, dropdown) {
    const value = item.textContent;
    input.value = value;
    this.value = value;
    dropdown.style.display = "none";

    if (this.onSelect) {
      this.onSelect(value);
    }

    input.focus();
  }
}

// Add SearchBox styles
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    .search-box {
      position: relative;
      width: 100%;
    }

    .search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: var(--spacing-xs);
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      max-height: 300px;
      overflow-y: auto;
      list-style: none;
      padding: 0;
      display: none;
      z-index: var(--z-dropdown);
      box-shadow: var(--shadow-md);
    }

    .search-suggestion-item {
      padding: var(--spacing-sm) var(--spacing-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
      border-bottom: 1px solid var(--color-border);
    }

    .search-suggestion-item:last-child {
      border-bottom: none;
    }

    .search-suggestion-item:hover,
    .search-suggestion-item[aria-selected="true"] {
      background-color: var(--color-surface);
    }

    .search-suggestion-item:active {
      background-color: var(--color-primary-50);
    }
  `;
  document.head.appendChild(style);
}
