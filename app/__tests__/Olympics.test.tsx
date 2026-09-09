import { act, fireEvent, render, screen } from '@testing-library/react';
import Olympics, { formatTime, medalFor } from '../Olympics';

function click(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}
function tick(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}
function finishPin() {
  tick(960);
  click('Stop digit 1');
  click('Stop digit 3');
  tick(1440);
  click('Stop digit 2');
  click('Verify PIN →');
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
});
afterEach(() => {
  jest.useRealTimers();
});

test('plays a complete race, excludes intermission time, saves best, copies result, and resets', async () => {
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  render(<Olympics />);
  click('Enter the games ↗');
  finishPin();
  expect(screen.getByText('Somehow, that worked.')).toBeInTheDocument();
  tick(60000);
  click('Next: Volume gymnastics →');
  for (let i = 0; i < 5; i++) click('+ 17');
  for (let i = 0; i < 5; i++) click('− 7');
  expect(screen.getByLabelText('Current volume')).toHaveTextContent('50%');
  click('That’s my volume →');
  click('Next: Submit sprint →');
  for (let i = 0; i < 5; i++) click('Submit ↗');
  click('Next: Checkbox hurdles →');
  click('Save preferences →');
  expect(screen.getByRole('status', { name: 'Game feedback' })).toHaveTextContent(
    'still subscribed',
  );
  screen.getAllByRole('checkbox').forEach((box) => fireEvent.click(box));
  click('Save preferences →');
  click('Next: Elevator roulette →');
  click('Floor 3');
  click('Floor 2');
  expect(screen.getByText('Next stop: floor 3')).toBeInTheDocument();
  click('Floor 3');
  click('Floor 1');
  click('Floor 4');
  click('Next: Password pentathlon →');
  const input = screen.getByLabelText('Your completely disposable password');
  fireEvent.change(input, { target: { value: 'Aegg18!' } });
  click('Please accept this →');
  expect(screen.getByRole('status', { name: 'Game feedback' })).toHaveTextContent(
    'remaining rules',
  );
  fireEvent.change(input, { target: { value: 'Aegg18x!' } });
  click('Please accept this →');
  expect(screen.getByText('You beat the interface.')).toBeInTheDocument();
  expect(Number(localStorage.getItem('bad-ui-olympics-six-event-best'))).toBe(2400);
  await act(async () => {
    click('Copy score ↗');
  });
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('2.4s. Gold medal!'));
  click('Race again ↻');
  expect(screen.getByRole('timer')).toHaveTextContent('0.0s');
  expect(screen.getByRole('button', { name: 'Stop digit 1' })).toBeInTheDocument();
});

test('rejects incomplete and incorrect PINs and allows a stopped digit to spin again', () => {
  render(<Olympics />);
  click('Enter the games ↗');
  click('Verify PIN →');
  expect(screen.getByRole('status', { name: 'Game feedback' })).toHaveTextContent(
    'Stop all three reels first',
  );
  click('Stop digit 1');
  click('Stop digit 2');
  click('Stop digit 3');
  click('Verify PIN →');
  expect(screen.getByRole('status', { name: 'Game feedback' })).toHaveTextContent('Incorrect PIN');
  click('Spin digit 1');
  tick(240);
  expect(screen.getByLabelText('Digit 1')).toHaveTextContent('1');
});

test('wraps volume at both ends and rejects a wrong volume', () => {
  render(<Olympics />);
  click('Enter the games ↗');
  finishPin();
  click('Next: Volume gymnastics →');
  click('− 7');
  expect(screen.getByLabelText('Current volume')).toHaveTextContent('94%');
  click('+ 17');
  expect(screen.getByLabelText('Current volume')).toHaveTextContent('10%');
  click('That’s my volume →');
  expect(screen.getByRole('status', { name: 'Game feedback' })).toHaveTextContent('Exactly 50%');
});

test('medal boundaries and time formatting', () => {
  expect(medalFor(59999)).toBe('Gold');
  expect(medalFor(60000)).toBe('Silver');
  expect(medalFor(120000)).toBe('Bronze');
  expect(formatTime(12345)).toBe('12.3s');
});
