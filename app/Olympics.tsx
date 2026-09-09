'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './olympics.module.scss';

const events = [
  {
    name: 'PINball machine',
    category: 'PRECISION',
    description: 'Stop each spinning digit on 4 · 0 · 4. Missed it? Spin again.',
    icon: '01',
  },
  {
    name: 'Volume gymnastics',
    category: 'MENTAL ATHLETICS',
    description: 'Set the volume to exactly 50%. The buttons have questionable qualifications.',
    icon: '02',
  },
  {
    name: 'Submit sprint',
    category: 'ENDURANCE',
    description:
      'Catch Submit five times. It relocates after every click. Yes, this is the whole form.',
    icon: '03',
  },
  {
    name: 'Checkbox hurdles',
    category: 'LEGAL ACROBATICS',
    description:
      'Reject every subscription. Read carefully: our legal team discovered double negatives.',
    icon: '04',
  },
  {
    name: 'Elevator roulette',
    category: 'SPATIAL CONFUSION',
    description:
      'Visit floors 3, 1, then 4. The keypad rotates after every press. Wrong floor? Your itinerary resets.',
    icon: '05',
  },
  {
    name: 'Password pentathlon',
    category: 'RULE JUGGLING',
    description:
      'Create a throwaway password that satisfies all five rules. Do not use a real password.',
    icon: '06',
  },
];
const checkboxLabels = [
  'Send me promotional emails',
  'Do not unsubscribe me from SMS offers',
  'Disable daily sales calls',
  'Do not enable partner notifications',
];
const floorTargets = [3, 1, 4];
const passwordRules = [
  {
    label: 'Exactly 8 characters. We charge by the pixel.',
    check: (value: string) => value.length === 8,
  },
  { label: 'Start with an uppercase letter.', check: (value: string) => /^[A-Z]/.test(value) },
  {
    label: 'Include “egg”. For security reasons, obviously.',
    check: (value: string) => value.includes('egg'),
  },
  {
    label: 'Exactly two digits, adding up to 9.',
    check: (value: string) => {
      const digits = value.match(/\d/g) ?? [];
      return digits.length === 2 && digits.reduce((sum, digit) => sum + Number(digit), 0) === 9;
    },
  },
  { label: 'End with ! to show enthusiasm.', check: (value: string) => value.endsWith('!') },
];
const target = [4, 0, 4];
export const formatTime = (milliseconds: number) => `${(milliseconds / 1000).toFixed(1)}s`;
export const medalFor = (milliseconds: number) =>
  milliseconds < 60000 ? 'Gold' : milliseconds < 120000 ? 'Silver' : 'Bronze';

export default function Olympics() {
  const [phase, setPhase] = useState<'ready' | 'playing' | 'between' | 'finished'>('ready');
  const [round, setRound] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState<number[]>([]);
  const [digits, setDigits] = useState([0, 0, 0]);
  const [spinning, setSpinning] = useState([true, true, true]);
  const [volume, setVolume] = useState(0);
  const [catches, setCatches] = useState(0);
  const [checks, setChecks] = useState([true, true, false, false]);
  const [floorStep, setFloorStep] = useState(0);
  const [keypadTurn, setKeypadTurn] = useState(0);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [best, setBest] = useState<number | null>(null);
  const [shareText, setShareText] = useState('');
  const started = useRef(0);
  const roundStarted = useRef(0);
  const locked = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try {
      const value = Number(localStorage.getItem('bad-ui-olympics-six-event-best'));
      if (Number.isFinite(value) && value > 0) setBest(value);
    } catch {
      /* Game remains playable when storage is unavailable. */
    }
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const timer = window.setInterval(() => setElapsed(performance.now() - started.current), 50);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || round !== 0) return;
    const timer = window.setInterval(() => {
      setDigits((current) =>
        current.map((digit, index) => (spinning[index] ? (digit + 1) % 10 : digit)),
      );
    }, 240);
    return () => window.clearInterval(timer);
  }, [phase, round, spinning]);

  useEffect(() => {
    if (phase !== 'ready') heading.current?.focus();
  }, [phase, round]);

  function start() {
    started.current = performance.now();
    roundStarted.current = started.current;
    locked.current = false;
    setRound(0);
    setElapsed(0);
    setSplits([]);
    setDigits([0, 0, 0]);
    setSpinning([true, true, true]);
    setVolume(0);
    setCatches(0);
    setChecks([true, true, false, false]);
    setFloorStep(0);
    setKeypadTurn(0);
    setPassword('');
    setMessage('');
    setShareText('');
    setPhase('playing');
  }

  function finishRound() {
    if (locked.current) return;
    locked.current = true;
    const now = performance.now();
    const total = now - started.current;
    setElapsed(total);
    setSplits((current) => [...current, now - roundStarted.current]);
    setMessage('');
    if (round < events.length - 1) {
      setPhase('between');
      return;
    }
    setPhase('finished');
    if (best === null || total < best) {
      setBest(total);
      try {
        localStorage.setItem('bad-ui-olympics-six-event-best', String(total));
      } catch {
        /* Optional local record. */
      }
    }
  }

  function nextRound() {
    // Intermissions do not count toward the race.
    const now = performance.now();
    started.current = now - elapsed;
    roundStarted.current = now;
    locked.current = false;
    setRound((current) => current + 1);
    setPhase('playing');
  }

  function checkPin() {
    if (spinning.some(Boolean)) {
      setMessage('Stop all three reels first. The form is getting dizzy.');
      return;
    }
    if (digits.every((digit, index) => digit === target[index])) finishRound();
    else setMessage('Incorrect PIN. Spin only the digits you want to change.');
  }

  async function share() {
    const text = `I survived all 6 events of Bad UI Olympics in ${formatTime(elapsed)}. ${medalFor(elapsed)} medal! Can you beat me? ${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Score copied. Go challenge someone.');
    } catch {
      setShareText(text);
      setMessage('Copy your score from the box below.');
    }
  }

  return (
    <div className={styles.arcade}>
      <div className={styles.topline}>
        <a className={styles.brand} href="/" aria-label="Bad UI Olympics home">
          <Image src="/logo.svg" width={40} height={40} alt="" />
          <span>BAD UI OLYMPICS</span>
        </a>
        <span>EST. 2026 / EXPECT FRICTION</span>
      </div>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>THE GAMES NOBODY ASKED FOR</p>
          <h1>
            BAD UI <span>OLYMPICS</span>
            <sup>™</sup>
          </h1>
        </div>
        <div className={styles.stamp}>
          100%
          <br />
          <span>USER HOSTILE</span>
        </div>
      </header>
      <div className={styles.ticker}>
        SIX EVENTS. ZERO USABILITY. <span> YOUR PATIENCE IS THE CONTROLLER. </span> SIX EVENTS. ZERO
        USABILITY.
      </div>
      <main id="games" className={styles.layout}>
        <aside className={styles.sidebar}>
          <p className={styles.eyebrow}>THE EVENT LINEUP</p>
          <ol>
            {events.map((event, index) => (
              <li
                key={event.name}
                className={index === round ? styles.active : ''}
                aria-current={index === round ? 'step' : undefined}
              >
                <span className={styles.eventNumber}>
                  {splits[index] !== undefined ? '✓' : event.icon}
                </span>
                <div>
                  <small>{event.category}</small>
                  <h2>{event.name}</h2>
                  {splits[index] !== undefined && <span>{formatTime(splits[index])}</span>}
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.record}>
            <span>PERSONAL BEST · THIS BROWSER</span>
            <strong>{best === null ? '— —' : formatTime(best)}</strong>
            <p>No account. No training. No excuses.</p>
          </div>
        </aside>
        <section className={styles.arena} aria-label="Game arena">
          <div className={styles.arenaBar}>
            <span>
              {phase === 'ready'
                ? 'ATHLETE CHECK-IN'
                : phase === 'finished'
                  ? 'OFFICIAL RESULTS'
                  : `EVENT 0${round + 1} / ${String(events.length).padStart(2, '0')}`}
            </span>
            <span role="timer" aria-label="Race time">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className={styles.stage}>
            {phase === 'ready' && (
              <>
                <div className={styles.heroNumber} aria-hidden="true">
                  404<span>UX NOT FOUND</span>
                </div>
                <h2 ref={heading} tabIndex={-1}>
                  Good luck.
                  <br />
                  You’ll need it.
                </h2>
                <p>
                  Six everyday tasks, made unnecessarily difficult. Beat the clock and earn your
                  medal.
                </p>
                <button className={styles.primary} onClick={start}>
                  Enter the games <span>↗</span>
                </button>
                <small>Under 60s: Gold · Under 120s: Silver · Finish: Bronze</small>
              </>
            )}
            {phase === 'playing' && (
              <>
                <h2 ref={heading} tabIndex={-1}>
                  {events[round].name}
                </h2>
                <p>{events[round].description}</p>
                {round === 0 && (
                  <div className={styles.pinGame}>
                    <div className={styles.target}>
                      YOUR VERY SECRET PIN: <strong>4 0 4</strong>
                    </div>
                    <div className={styles.reels}>
                      {digits.map((digit, index) => (
                        <div
                          key={index}
                          className={
                            !spinning[index] && digit === target[index] ? styles.correct : ''
                          }
                        >
                          <output aria-live="off" aria-label={`Digit ${index + 1}`}>
                            {digit}
                          </output>
                          <button
                            onClick={() =>
                              setSpinning((current) =>
                                current.map((value, i) => (i === index ? !value : value)),
                              )
                            }
                            aria-label={`${spinning[index] ? 'Stop' : 'Spin'} digit ${index + 1}`}
                          >
                            {spinning[index] ? 'STOP' : 'SPIN ↻'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className={styles.primary} onClick={checkPin}>
                      Verify PIN →
                    </button>
                  </div>
                )}
                {round === 1 && (
                  <div className={styles.volumeGame}>
                    <output className={styles.volume} aria-label="Current volume">
                      {volume}
                      <span>%</span>
                    </output>
                    <div className={styles.meter}>
                      <div style={{ width: `${volume}%` }} />
                    </div>
                    <div className={styles.volumeButtons}>
                      <button onClick={() => setVolume((v) => (v + 17) % 101)}>+ 17</button>
                      <button onClick={() => setVolume((v) => (v + 94) % 101)}>− 7</button>
                    </div>
                    <small>Volume wraps around between 0 and 100. Naturally.</small>
                    <button
                      className={styles.primary}
                      onClick={() =>
                        volume === 50
                          ? finishRound()
                          : setMessage(
                              'Exactly 50%, please. Close enough is not in our vocabulary.',
                            )
                      }
                    >
                      That’s my volume →
                    </button>
                  </div>
                )}
                {round === 2 && (
                  <>
                    <div className={styles.sprint}>
                      <span className={styles.catchCount}>{catches} / 5 CAUGHT</span>
                      <button
                        className={styles.runaway}
                        style={{
                          left: `${[6, 57, 12, 54, 30][catches]}%`,
                          top: `${[18, 57, 65, 12, 40][catches]}%`,
                        }}
                        onClick={() => {
                          if (catches === 4) finishRound();
                          else setCatches((v) => v + 1);
                        }}
                      >
                        Submit ↗
                      </button>
                    </div>
                    <small>Mouse, touch, or Tab + Enter. All athletes welcome.</small>
                  </>
                )}
                {round === 3 && (
                  <div className={styles.puzzle}>
                    <fieldset className={styles.checks}>
                      <legend>Your inbox deserves peace.</legend>
                      {checkboxLabels.map((label, index) => (
                        <label key={label}>
                          <input
                            type="checkbox"
                            checked={checks[index]}
                            onChange={() =>
                              setChecks((current) =>
                                current.map((value, i) => (i === index ? !value : value)),
                              )
                            }
                          />
                          {label}
                        </label>
                      ))}
                    </fieldset>
                    <button
                      className={styles.primary}
                      onClick={() =>
                        checks.every((value, i) => value === i >= 2)
                          ? finishRound()
                          : setMessage(
                              'You are still subscribed to something. The fine print wins again.',
                            )
                      }
                    >
                      Save preferences →
                    </button>
                  </div>
                )}
                {round === 4 && (
                  <div className={styles.puzzle}>
                    <p className={styles.floorRoute}>
                      ITINERARY:{' '}
                      {floorTargets.map((floor, i) => (
                        <span key={i} className={i < floorStep ? styles.visited : ''}>
                          {i < floorStep ? '✓' : floor}
                          {i < 2 ? ' → ' : ''}
                        </span>
                      ))}
                    </p>
                    <p role="status">Next stop: floor {floorTargets[floorStep]}</p>
                    <div className={styles.keypad}>
                      {Array.from({ length: 6 }, (_, index) => ((index + keypadTurn) % 6) + 1).map(
                        (floor) => (
                          <button
                            key={floor}
                            aria-label={'Floor ' + floor}
                            onClick={() => {
                              setKeypadTurn((turn) => (turn + 1) % 6);
                              if (floor !== floorTargets[floorStep]) {
                                setFloorStep(0);
                                setMessage('Wrong floor. Back to the lobby; start with floor 3.');
                              } else if (floorStep === floorTargets.length - 1) finishRound();
                              else {
                                setFloorStep((step) => step + 1);
                                setMessage(
                                  'Correct floor. The buttons have rearranged themselves.',
                                );
                              }
                            }}
                          >
                            {floor}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
                {round === 5 && (
                  <form
                    className={styles.puzzle}
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (passwordRules.every((rule) => rule.check(password))) finishRound();
                      else
                        setMessage(
                          'The password committee is not impressed. Check the remaining rules.',
                        );
                    }}
                  >
                    <label className={styles.passwordLabel} htmlFor="olympics-password">
                      Your completely disposable password
                    </label>
                    <input
                      id="olympics-password"
                      className={styles.passwordInput}
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      autoCapitalize="off"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-describedby="password-rules"
                    />
                    <ul id="password-rules" className={styles.rules}>
                      {passwordRules.map((rule) => (
                        <li key={rule.label} className={rule.check(password) ? styles.visited : ''}>
                          <span>{rule.check(password) ? '✓ Met: ' : '○ Needed: '}</span>
                          {rule.label}
                        </li>
                      ))}
                    </ul>
                    <button className={styles.primary} type="submit">
                      Please accept this →
                    </button>
                  </form>
                )}
              </>
            )}
            {phase === 'between' && (
              <>
                <div className={styles.successMark} aria-hidden="true">
                  ✓
                </div>
                <h2 ref={heading} tabIndex={-1}>
                  Somehow, that worked.
                </h2>
                <p>
                  {events[round].name} completed in <strong>{formatTime(splits[round])}</strong>.
                  Take a breath; the clock is paused.
                </p>
                <button className={styles.primary} onClick={nextRound}>
                  Next: {events[round + 1].name} →
                </button>
              </>
            )}
            {phase === 'finished' && (
              <>
                <div className={styles.medal}>
                  {medalFor(elapsed)}
                  <span>MEDAL / CERTIFIED SURVIVOR</span>
                </div>
                <h2 ref={heading} tabIndex={-1}>
                  You beat the interface.
                </h2>
                <p className={styles.finalTime}>{formatTime(elapsed)}</p>
                <p>Six events. One deeply unnecessary achievement.</p>
                <div className={styles.resultActions}>
                  <button className={styles.primary} onClick={share}>
                    Copy score ↗
                  </button>
                  <button className={styles.secondary} onClick={start}>
                    Race again ↻
                  </button>
                </div>
                {shareText && (
                  <textarea
                    aria-label="Shareable score"
                    readOnly
                    value={shareText}
                    onFocus={(event) => event.target.select()}
                  />
                )}
              </>
            )}
            <p role="status" aria-label="Game feedback" className={styles.message}>
              {message}
            </p>
          </div>
          <div className={styles.arenaFooter}>
            <span>BAD DESIGN. GOOD SPORT.</span>
            {phase === 'playing' || phase === 'between' ? (
              <button onClick={start}>Restart race ↻</button>
            ) : (
              <span>KEYBOARD + TOUCH FRIENDLY</span>
            )}
          </div>
        </section>
      </main>
      <footer className={styles.appFooter}>
        <div>
          <a className={styles.brand} href="/" aria-label="Bad UI Olympics home">
            <Image src="/logo.svg" width={36} height={36} alt="" />
            <span>BAD UI OLYMPICS</span>
          </a>
          <p>Bad design. Good sport.</p>
        </div>
        <div className={styles.footerDetails}>
          <span>An independent game by Kitty Kio</span>
          <span>Personal bests stay in this browser.</span>
          <a href="#games">Back to the games ↑</a>
        </div>
        <p className={styles.footerNote}>
          © 2026 Bad UI Olympics. Please don’t build real forms like this.
        </p>
      </footer>
    </div>
  );
}
