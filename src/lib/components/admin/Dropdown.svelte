<script lang="ts">
  import { ChevronDown, Check } from 'lucide-svelte';

  interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    options: Option[];
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    size?: 'sm' | 'md' | 'lg';
    searchable?: boolean;
  }

  let { 
    options = [], 
    value = $bindable(), 
    placeholder = "Select an option", 
    disabled = false, 
    class: className = "", 
    size = "md",
    searchable = false 
  }: Props = $props();

  let isOpen = $state(false);
  let searchTerm = $state("");
  let dropdownRef: HTMLDivElement;
  let buttonRef: HTMLButtonElement;

  const selectedOption = $derived(
    options.find(option => option.value === value)
  );

  const filteredOptions = $derived(() => {
    if (!searchable || !searchTerm) return options;
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  function toggleDropdown() {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen && searchable) {
      setTimeout(() => {
        const searchInput = dropdownRef?.querySelector('input');
        searchInput?.focus();
      }, 0);
    }
  }

  function selectOption(option: Option) {
    if (option.disabled) return;
    
    value = option.value;
    isOpen = false;
    searchTerm = "";
  }

  function handleKeydown(event: KeyboardEvent) {
    if (disabled) return;

    switch (event.key) {
      case 'Escape':
        isOpen = false;
        buttonRef?.focus();
        break;
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault();
          isOpen = true;
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          isOpen = true;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        break;
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
      searchTerm = "";
    }
  }

  const sizeClasses = {
    sm: 'admin-dropdown-sm',
    md: 'admin-dropdown-md',
    lg: 'admin-dropdown-lg'
  };

  const iconSizes = {
    sm: 'admin-dropdown-icon-sm',
    md: 'admin-dropdown-icon-md', 
    lg: 'admin-dropdown-icon-lg'
  };

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  });
</script>

<!-- svelte-ignore a11y_role_has_required_aria_props -->
<div 
  bind:this={dropdownRef}
  class="admin-dropdown relative {className}"
  role="combobox"
  aria-expanded={isOpen}
>
  <button
    bind:this={buttonRef}
    type="button"
    onclick={toggleDropdown}
    onkeydown={handleKeydown}
    class="admin-dropdown-button {sizeClasses[size]} {disabled ? 'admin-dropdown-disabled' : ''}"
    {disabled}
    aria-haspopup="listbox"
  >
    <span class="admin-dropdown-text">
      {selectedOption?.label || placeholder}
    </span>
    <ChevronDown 
      class="admin-dropdown-icon {iconSizes[size]} {isOpen ? 'rotate-180' : ''}" 
    />
  </button>

  {#if isOpen}
    <div class="admin-dropdown-menu">
      {#if searchable}
        <div class="admin-dropdown-search">
          <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search options..."
            class="admin-dropdown-search-input"
          />
        </div>
      {/if}
      
      <ul class="admin-dropdown-options" role="listbox">
        {#each filteredOptions() as option (option.value)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <li
            role="option"
            aria-selected={option.value === value}
            class="admin-dropdown-option {option.value === value ? 'selected' : ''} {option.disabled ? 'disabled' : ''}"
            onclick={() => selectOption(option)}
          >
            <span class="admin-dropdown-option-text">
              {option.label}
            </span>
            {#if option.value === value}
              <Check class="admin-dropdown-check {iconSizes[size]}" />
            {/if}
          </li>
        {:else}
          <li class="admin-dropdown-no-results">
            No options found
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  .admin-dropdown {
    position: relative;
    display: inline-block;
    min-width: 0;
  }

  .admin-dropdown-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid var(--admin-border);
    border-radius: 8px;
    background-color: var(--admin-card-bg);
    color: var(--admin-text-primary);
    font-weight: 500;
    transition: all 200ms ease;
    cursor: pointer;
  }

  .admin-dropdown-button:focus {
    outline: none;
    border-color: var(--admin-text-secondary);
    box-shadow: 0 0 0 2px rgba(74, 74, 74, 0.1);
  }

  .admin-dropdown-button:hover:not(.admin-dropdown-disabled) {
    border-color: var(--admin-text-secondary);
    background-color: var(--admin-hover);
  }

  .admin-dropdown-disabled {
    background-color: var(--admin-background);
    color: var(--admin-text-tertiary);
    cursor: not-allowed;
  }

  .admin-dropdown-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    flex: 1;
  }

  .admin-dropdown-icon {
    color: var(--admin-text-secondary);
    transition: transform 200ms ease;
    flex-shrink: 0;
  }

  .admin-dropdown-icon.rotate-180 {
    transform: rotate(180deg);
  }

  .admin-dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 8px;
    background-color: var(--admin-card-bg);
    border: 1px solid var(--admin-border);
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 240px;
    overflow: hidden;
  }

  .admin-dropdown-search {
    padding: 12px;
    border-bottom: 1px solid var(--admin-border);
  }

  .admin-dropdown-search-input {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid var(--admin-border);
    border-radius: 6px;
    background-color: var(--admin-card-bg);
    color: var(--admin-text-primary);
  }

  .admin-dropdown-search-input::placeholder {
    color: var(--admin-text-tertiary);
  }

  .admin-dropdown-search-input:focus {
    outline: none;
    border-color: var(--admin-text-secondary);
    box-shadow: 0 0 0 2px rgba(74, 74, 74, 0.1);
  }

  .admin-dropdown-options {
    max-height: 192px;
    overflow-y: auto;
  }

  .admin-dropdown-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    font-size: 14px;
    color: var(--admin-text-primary);
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .admin-dropdown-option:hover {
    background-color: var(--admin-hover);
  }

  .admin-dropdown-option.selected {
    background-color: var(--admin-background);
    color: var(--admin-text-primary);
    font-weight: 500;
  }

  .admin-dropdown-option.disabled {
    color: var(--admin-text-tertiary);
    cursor: not-allowed;
  }

  .admin-dropdown-option.disabled:hover {
    background-color: transparent;
  }

  .admin-dropdown-option-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    text-align: left;
  }

  .admin-dropdown-check {
    color: var(--admin-text-primary);
    flex-shrink: 0;
    margin-left: 8px;
  }

  .admin-dropdown-no-results {
    padding: 12px 16px;
    font-size: 14px;
    color: var(--admin-text-tertiary);
    font-style: italic;
    text-align: center;
  }

  /* Custom scrollbar for options */
  .admin-dropdown-options::-webkit-scrollbar {
    width: 6px;
  }

  .admin-dropdown-options::-webkit-scrollbar-track {
    background: var(--admin-background);
  }

  .admin-dropdown-options::-webkit-scrollbar-thumb {
    background: var(--admin-border);
    border-radius: 3px;
  }

  .admin-dropdown-options::-webkit-scrollbar-thumb:hover {
    background: var(--admin-text-tertiary);
  }

  /* Size variants */
  .admin-dropdown-button.admin-dropdown-sm {
    height: 32px;
    font-size: 12px;
    padding: 0 12px;
  }

  .admin-dropdown-button.admin-dropdown-md {
    height: 40px;
    font-size: 14px;
    padding: 0 16px;
  }

  .admin-dropdown-button.admin-dropdown-lg {
    height: 48px;
    font-size: 16px;
    padding: 0 20px;
  }

  .admin-dropdown-icon-sm {
    width: 12px;
    height: 12px;
  }

  .admin-dropdown-icon-md {
    width: 16px;
    height: 16px;
  }

  .admin-dropdown-icon-lg {
    width: 20px;
    height: 20px;
  }

  .admin-dropdown-check.admin-dropdown-icon-sm {
    width: 12px;
    height: 12px;
  }

  .admin-dropdown-check.admin-dropdown-icon-md {
    width: 16px;
    height: 16px;
  }

  .admin-dropdown-check.admin-dropdown-icon-lg {
    width: 20px;
    height: 20px;
  }
</style>