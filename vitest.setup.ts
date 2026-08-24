/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

class TestResizeObserver {
    readonly disconnect = vi.fn();
    readonly observe = vi.fn();
    readonly unobserve = vi.fn();
}

vi.stubGlobal('ResizeObserver', TestResizeObserver);
