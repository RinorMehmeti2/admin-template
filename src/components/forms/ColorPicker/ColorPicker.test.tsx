import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { runAxe } from '@/test-utils/a11y';
import { ColorPicker } from './ColorPicker';
import {
  formatColor,
  hsvaToRgba,
  parseColor,
  rgbaToHsva,
  hsvToRgb,
  rgbToHsv,
  hsvToHsl,
  hslToHsv,
} from './colorUtils';

function openPanel(user: ReturnType<typeof userEvent.setup>) {
  return user.click(screen.getByRole('button', { name: /pick a color/i }));
}

function mockRect(el: HTMLElement, width: number, height: number, left = 0, top = 0) {
  el.getBoundingClientRect = () =>
    ({
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      x: left,
      y: top,
      toJSON() {},
    }) as DOMRect;
}

describe('colorUtils', () => {
  it('hsv ↔ rgb round-trip on integer bytes', () => {
    for (const [r, g, b] of [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [59, 130, 246], // tailwind blue-500
      [200, 60, 100],
      [12, 34, 200],
    ]) {
      const hsv = rgbToHsv(r!, g!, b!);
      const back = hsvToRgb(hsv.h, hsv.s, hsv.v);
      expect(back.r).toBe(r);
      expect(back.g).toBe(g);
      expect(back.b).toBe(b);
    }
  });

  it('hsv ↔ hsl round-trip', () => {
    for (const [h, s, v] of [
      [0, 1, 1],
      [120, 0.5, 0.5],
      [200, 0.2, 0.9],
      [359, 0.8, 0.4],
    ]) {
      const hsl = hsvToHsl(h!, s!, v!);
      const back = hslToHsv(hsl.h, hsl.s, hsl.l);
      expect(back.h).toBeCloseTo(h!, 5);
      expect(back.s).toBeCloseTo(s!, 5);
      expect(back.v).toBeCloseTo(v!, 5);
    }
  });

  it('parses #rrggbb', () => {
    const c = parseColor('#ff0000')!;
    expect(c).not.toBeNull();
    const rgb = hsvaToRgba(c);
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('parses 3-digit hex', () => {
    const c = parseColor('#0f0')!;
    const rgb = hsvaToRgba(c);
    expect(rgb).toMatchObject({ r: 0, g: 255, b: 0 });
  });

  it('parses #rrggbbaa', () => {
    const c = parseColor('#ff000080')!;
    const rgb = hsvaToRgba(c);
    expect(rgb.r).toBe(255);
    expect(Math.round(rgb.a * 255)).toBe(128);
  });

  it('parses rgba()', () => {
    const c = parseColor('rgba(59, 130, 246, 0.5)')!;
    const rgb = hsvaToRgba(c);
    expect(rgb).toMatchObject({ r: 59, g: 130, b: 246 });
    expect(rgb.a).toBeCloseTo(0.5, 2);
  });

  it('parses hsl()', () => {
    const c = parseColor('hsl(120, 100%, 50%)')!;
    const rgb = hsvaToRgba(c);
    expect(rgb).toMatchObject({ r: 0, g: 255, b: 0 });
  });

  it('rejects garbage', () => {
    expect(parseColor('not a color')).toBeNull();
    expect(parseColor('#zz')).toBeNull();
    expect(parseColor('rgb(1,2)')).toBeNull();
  });

  it('hex/rgb/hsl format toggle preserves RGB bytes', () => {
    const hsva = rgbaToHsva({ r: 59, g: 130, b: 246, a: 1 });
    const hex = formatColor(hsva, 'hex', false);
    const rgb = formatColor(hsva, 'rgb', false);
    const hsl = formatColor(hsva, 'hsl', false);
    expect(hex.toLowerCase()).toBe('#3b82f6');
    expect(rgb).toBe('rgb(59, 130, 246)');
    // Re-parse each and confirm RGB bytes survive within 1 byte tolerance.
    for (const s of [hex, rgb, hsl]) {
      const back = hsvaToRgba(parseColor(s)!);
      expect(Math.abs(back.r - 59)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.g - 130)).toBeLessThanOrEqual(1);
      expect(Math.abs(back.b - 246)).toBeLessThanOrEqual(1);
    }
  });
});

describe('ColorPicker', () => {
  it('renders trigger swatch and current value', () => {
    render(<ColorPicker defaultValue="#3b82f6" />);
    expect(screen.getByRole('button', { name: /pick a color/i })).toBeInTheDocument();
    expect(screen.getByText('#3b82f6')).toBeInTheDocument();
  });

  it('click opens the panel; escape closes', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#3b82f6" />);
    await openPanel(user);
    expect(screen.getByRole('dialog', { name: /color picker/i })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('preset click updates value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ColorPicker
        defaultValue="#000000"
        onValueChange={onValueChange}
        presets={['#ef4444', '#10b981', '#3b82f6']}
      />,
    );
    await openPanel(user);
    await user.click(screen.getByRole('button', { name: /use color #ef4444/i }));
    expect(onValueChange).toHaveBeenLastCalledWith('#ef4444');
  });

  it('format toggle changes emitted string', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = useState('#3b82f6');
      return <ColorPicker value={v} onValueChange={setV} />;
    }
    render(<Harness />);
    await openPanel(user);
    const rgbBtn = screen.getByRole('radio', { name: 'rgb' });
    await user.click(rgbBtn);
    expect(screen.getByText('rgb(59, 130, 246)')).toBeInTheDocument();
    const hslBtn = screen.getByRole('radio', { name: 'hsl' });
    await user.click(hslBtn);
    expect(screen.getByText(/^hsl\(/)).toBeInTheDocument();
  });

  it('alpha slider appears only when withAlpha', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ColorPicker defaultValue="#3b82f6" />);
    await openPanel(user);
    expect(screen.queryByRole('slider', { name: 'Alpha' })).toBeNull();
    rerender(<ColorPicker defaultValue="#3b82f6" withAlpha />);
    expect(screen.getByRole('slider', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('hex shows alpha when withAlpha and a < 1', async () => {
    const user = userEvent.setup();
    function Harness() {
      const [v, setV] = useState('rgba(255, 0, 0, 0.5)');
      return <ColorPicker value={v} onValueChange={setV} withAlpha format="hex" />;
    }
    render(<Harness />);
    await openPanel(user);
    // Switch to hex from rgb (it's already hex per `format` default? — we set format='hex')
    const text = screen.getByText(/^#ff000080$/i);
    expect(text).toBeInTheDocument();
  });

  it('text input parses on Enter; invalid shakes and reverts', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#000000" onValueChange={onValueChange} />);
    await openPanel(user);
    const input = screen.getByLabelText(/color value/i);
    await user.clear(input);
    await user.type(input, '#3b82f6{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('#3b82f6');

    await user.clear(input);
    await user.type(input, 'not a color{Enter}');
    // Onblur/Enter triggers commitText which sets shaking. Onblur the input reverts to last valid.
    expect((input as HTMLInputElement).value).toBe('#3b82f6');
  });

  it('hue slider keyboard changes hue', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />);
    await openPanel(user);
    const hue = screen.getByRole('slider', { name: 'Hue' });
    hue.focus();
    await user.keyboard('{ArrowRight}');
    // Hue increments by 1 → red (h=0) goes to h=1 → still emits a hex string.
    expect(onValueChange).toHaveBeenCalled();
    const lastCall = onValueChange.mock.calls.at(-1)![0] as string;
    expect(lastCall).toMatch(/^#/);
    expect(lastCall.toLowerCase()).not.toBe('#ff0000');
  });

  it('SV canvas pointer-down updates color', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ColorPicker defaultValue="#ff0000" onValueChange={onValueChange} />);
    await openPanel(user);
    // The pointer-receiving div is the inner div under the SV group.
    const svGroup = screen.getByRole('group', { name: /saturation and brightness/i });
    // First child div is the visual gradient + pointer target.
    const target = svGroup.querySelector('div') as HTMLDivElement;
    expect(target).not.toBeNull();
    mockRect(target, 200, 120);
    // Click at center → s=0.5, v=0.5
    await act(async () => {
      await user.pointer({
        target,
        coords: { clientX: 100, clientY: 60 },
        keys: '[MouseLeft]',
      });
    });
    expect(onValueChange).toHaveBeenCalled();
    const out = onValueChange.mock.calls.at(-1)![0] as string;
    expect(out).toMatch(/^#/);
    expect(out.toLowerCase()).not.toBe('#ff0000');
  });

  it('disabled blocks panel open', async () => {
    const user = userEvent.setup();
    render(<ColorPicker defaultValue="#3b82f6" disabled />);
    const trigger = screen.getByRole('button', { name: /pick a color/i });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('name prop emits a hidden input for form submission', () => {
    const { container } = render(<ColorPicker defaultValue="#3b82f6" name="brand" />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement | null;
    expect(hidden).not.toBeNull();
    expect(hidden!.name).toBe('brand');
    expect(hidden!.value).toBe('#3b82f6');
  });

  it('has no a11y violations (closed)', async () => {
    const { container } = render(
      <div>
        <span id="cp-lbl">Brand color</span>
        <ColorPicker aria-labelledby="cp-lbl" defaultValue="#3b82f6" />
      </div>,
    );
    expect(await runAxe(container)).toHaveNoViolations();
  });
});
