/**
 * Tests for UserComponent in App.tsx
 *
 * NOTE: UserComponent is not currently exported from App.tsx.
 * Add `export` (or `export default`) to the function declaration
 * before running these tests:
 *   export function UserComponent() { ... }
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserComponent } from './App';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal Response-like object for mocking global.fetch */
function makeFetchResponse(data: unknown, ok = true) {
  return {
    ok,
    json: () => Promise.resolve(data),
  } as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering — initial state
// ---------------------------------------------------------------------------

describe('UserComponent — initial render', () => {
  it('renders without crashing when user is null', async () => {
    // fetch never resolves during this test
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    const { container } = render(<UserComponent />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('renders an empty div before fetch resolves', async () => {
    global.fetch = jest.fn(() => new Promise(() => {})) as jest.Mock;

    const { container } = render(<UserComponent />);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
    expect(div?.textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Rendering — after successful fetch
// ---------------------------------------------------------------------------

describe('UserComponent — successful data fetch', () => {
  it('renders the user name returned by the API', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeFetchResponse({ name: 'Alice' })) as jest.Mock;

    render(<UserComponent />);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('renders a different user name correctly', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeFetchResponse({ name: '홍길동' })) as jest.Mock;

    render(<UserComponent />);

    await waitFor(() => {
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });
  });

  it('renders nothing for name when API returns user without a name field', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeFetchResponse({ id: 42 })) as jest.Mock;

    const { container } = render(<UserComponent />);

    await waitFor(() => {
      // div exists but name is undefined → optional chaining renders nothing
      expect(container.querySelector('div')?.textContent).toBe('');
    });
  });

  it('renders nothing for name when API returns null', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(makeFetchResponse(null)) as jest.Mock;

    const { container } = render(<UserComponent />);

    await waitFor(() => {
      expect(container.querySelector('div')?.textContent).toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// Fetch call behaviour
// ---------------------------------------------------------------------------

describe('UserComponent — fetch behaviour', () => {
  it('calls fetch on mount', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(makeFetchResponse({ name: 'Bob' })) as jest.Mock;

    render(<UserComponent />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it('fetches from the correct endpoint', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(makeFetchResponse({ name: 'Bob' })) as jest.Mock;

    render(<UserComponent />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/user');
    });
  });

  it('calls fetch more than once due to [user] dependency bug (regression)', async () => {
    /**
     * Bug: the useEffect dependency array is [user] instead of [].
     * This causes a re-fetch every time setUser() updates state,
     * resulting in an infinite fetch loop.
     * This test documents the current (buggy) behaviour so that any
     * future fix is intentional and explicit.
     */
    let callCount = 0;
    global.fetch = jest.fn(() => {
      callCount += 1;
      return Promise.resolve(makeFetchResponse({ name: 'Test' }));
    }) as jest.Mock;

    render(<UserComponent />);

    // Allow several re-render cycles
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // With the [user] bug, fetch is called more than once
    expect(callCount).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// Error / edge cases
// ---------------------------------------------------------------------------

describe('UserComponent — error handling', () => {
  it('does not throw when fetch rejects (no error boundary)', async () => {
    // Suppress the unhandled rejection noise in test output
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValue(new Error('Network error')) as jest.Mock;

    expect(() => render(<UserComponent />)).not.toThrow();

    consoleSpy.mockRestore();
  });

  it('renders a div wrapper regardless of fetch outcome', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('fail')) as jest.Mock;

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { container } = render(<UserComponent />);
    expect(container.querySelector('div')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});