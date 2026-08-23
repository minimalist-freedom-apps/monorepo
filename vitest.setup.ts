/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const testCreateResizeObserver = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', testCreateResizeObserver);
