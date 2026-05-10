import { describe, it, expect, vi } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { PhoneInput, type PhoneInputHandle } from './PhoneInput';

function getNationalInput(): HTMLInputElement {
  const tel = document.querySelector('input[type="tel"]');
  if (tel === null) throw new Error('Phone input not found');
  return tel as HTMLInputElement;
}

describe('PhoneInput', () => {
  it('formats US number as you type', async () => {
    const user = userEvent.setup();
    render(<PhoneInput defaultCountry="US" aria-label="Phone" />);
    const input = getNationalInput();
    await user.type(input, '4155551212');
    expect(input).toHaveValue('(415) 555-1212');
  });

  it('formats GB number as you type', async () => {
    const user = userEvent.setup();
    render(<PhoneInput defaultCountry="GB" aria-label="Phone" />);
    const input = getNationalInput();
    // GB national format expects the trunk prefix `0`.
    await user.type(input, '02079460958');
    expect(input).toHaveValue('020 7946 0958');
  });

  it('formats DE number as you type', async () => {
    const user = userEvent.setup();
    render(<PhoneInput defaultCountry="DE" aria-label="Phone" />);
    const input = getNationalInput();
    await user.type(input, '030901820');
    expect(input.value.startsWith('030')).toBe(true);
    expect(input.value.replace(/\D/g, '')).toBe('030901820');
  });

  it('parses pasted E.164 and switches country', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput defaultCountry="US" onValueChange={onValueChange} aria-label="Phone" />);
    const input = getNationalInput();
    await user.click(input);
    await user.paste('+442079460958');
    expect(input.value.startsWith('020')).toBe(true);
    expect(onValueChange).toHaveBeenLastCalledWith('+442079460958');
  });

  it('emits null while invalid and E.164 when valid', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PhoneInput defaultCountry="US" onValueChange={onValueChange} aria-label="Phone" />);
    const input = getNationalInput();
    await user.type(input, '415');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await user.type(input, '5551212');
    expect(onValueChange).toHaveBeenLastCalledWith('+14155551212');
  });

  it('exposes isValid + countryCode + e164 on ref handle', async () => {
    const user = userEvent.setup();
    let handle: PhoneInputHandle | null = null;
    function Harness() {
      const ref = useRef<PhoneInputHandle>(null);
      handle = ref.current;
      return (
        <PhoneInput
          ref={(h) => {
            handle = h;
          }}
          defaultCountry="US"
          aria-label="Phone"
        />
      );
    }
    render(<Harness />);
    const input = getNationalInput();
    await user.type(input, '4155551212');
    expect(handle).not.toBeNull();
    expect(handle!.isValid).toBe(true);
    expect(handle!.countryCode).toBe('US');
    expect(handle!.e164).toBe('+14155551212');
  });

  it('switching country reformats current digits', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = useState<string | null>(null);
      return (
        <>
          <PhoneInput defaultCountry="US" onValueChange={setV} aria-label="Phone" />
          <output data-testid="out">{v ?? ''}</output>
        </>
      );
    }
    render(<Harness />);
    const input = getNationalInput();
    await user.type(input, '2079460958');
    const usFormatted = input.value;
    expect(usFormatted).toContain('(207)');
    // Now switch country to GB.
    const trigger = screen.getByRole('button', { name: /country/i });
    await user.click(trigger);
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'United Kingdom');
    const listbox = screen.getByRole('listbox');
    const gb = within(listbox).getAllByRole('option').find((el) =>
      el.textContent?.includes('United Kingdom'),
    );
    expect(gb).toBeDefined();
    await user.click(gb!);
    expect(input.value).not.toBe(usFormatted);
    expect(input.value.replace(/\D/g, '')).toBe('2079460958');
  });

  it('honors preferredCountries at top of list', async () => {
    const user = userEvent.setup();
    render(
      <PhoneInput
        defaultCountry="US"
        preferredCountries={['DE', 'FR']}
        aria-label="Phone"
      />,
    );
    await user.click(screen.getByRole('button', { name: /country/i }));
    const listbox = await screen.findByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options[0]?.textContent).toContain('Germany');
    expect(options[1]?.textContent).toContain('France');
  });

  it('disabled state blocks interaction', async () => {
    render(<PhoneInput defaultCountry="US" disabled aria-label="Phone" />);
    expect(getNationalInput()).toBeDisabled();
    expect(screen.getByRole('button', { name: /country/i })).toBeDisabled();
  });

  it('error variant applies danger ring', () => {
    render(<PhoneInput defaultCountry="US" error aria-label="Phone" />);
    const input = getNationalInput();
    const shell = input.parentElement;
    expect(shell?.className).toContain('border-danger');
  });

  it('controlled value parses E.164 to display', () => {
    render(<PhoneInput value="+14155551212" aria-label="Phone" />);
    const input = getNationalInput();
    expect(input).toHaveValue('(415) 555-1212');
  });

  it('country picker opens, search filters, ESC closes', async () => {
    const user = userEvent.setup();
    render(<PhoneInput defaultCountry="US" aria-label="Phone" />);
    const trigger = screen.getByRole('button', { name: /country/i });
    await user.click(trigger);
    const search = await screen.findByRole('searchbox');
    await user.type(search, 'germ');
    const options = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(options.some((o) => o.textContent?.includes('Germany'))).toBe(true);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="ph1">Phone</label>
        <PhoneInput id="ph1" defaultCountry="US" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
