import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────
   UivDigit — Direct adaptation of Uiverse "friendly-dingo-90"
   https://uiverse.io/whoisyourdeadie/friendly-dingo-90
   
   Single 3-D card flipping continuously from 0° to -180°.
   Uses content: attr(data-num) and content: attr(data-num-next)
   with the exact line-height: 1.38 and line-height: 0 proportions
   for buttery-smooth, hardware-accelerated mechanical flipping.
───────────────────────────────────────────────────────────── */
interface UivDigitProps {
  value: number;
}

const UivDigit: React.FC<UivDigitProps> = ({ value }) => {
  const [curr, setCurr] = useState(value);
  const [next, setNext] = useState(value);
  const [flipping, setFlipping] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value === prevRef.current) return;
    prevRef.current = value;
    setNext(value);
    setFlipping(true);

    const timer = setTimeout(() => {
      setCurr(value);
      setFlipping(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="uiv-nums" data-num={curr}>
      {/* 1. Behind top: reveals next digit top half as flipper drops */}
      <div className="uiv-next-top" data-num={next} />

      {/* 2. Behind bottom: shows current bottom half until flipper lands */}
      <div className="uiv-curr-bottom" data-num={curr} />

      {/* 3. The 3D Flipping Flap: rotates 0° -> -180° in one fluid motion */}
      <div
        className={`uiv-num ${flipping ? 'uiv-flip' : ''}`}
        data-num={curr}
        data-num-next={next}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   UivUnit — 2 digits + label (DAYS / HOURS / MINS / SECS)
───────────────────────────────────────────────────────────── */
interface UivUnitProps {
  value: number;
  label: string;
}

const UivUnit: React.FC<UivUnitProps> = ({ value, label }) => {
  const safeVal = Math.max(0, Math.floor(value));
  const tens = Math.floor(safeVal / 10);
  const ones = safeVal % 10;

  return (
    <div className="uiv-unit">
      <div className="uiv-digits">
        <UivDigit value={tens} />
        <UivDigit value={ones} />
      </div>
      <span className="uiv-label">{label}</span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   FlipClock — exported countdown timer
───────────────────────────────────────────────────────────── */
interface FlipClockProps {
  targetDate: Date;
  title?: string;
}

export const FlipClock: React.FC<FlipClockProps> = ({
  targetDate,
  title = 'NEXT LIVE COHORT STARTS IN:',
}) => {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
      seconds: Math.floor((diff % 60_000) / 1_000),
    };
  };

  const [time, setTime] = useState(calc);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(calc());
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  return (
    <div className="uiv-container">
      <p className="uiv-title">{title}</p>
      <div className="uiv-row">
        <UivUnit value={time.days} label="DAYS" />
        <span className="uiv-sep">:</span>
        <UivUnit value={time.hours} label="HOURS" />
        <span className="uiv-sep">:</span>
        <UivUnit value={time.minutes} label="MINS" />
        <span className="uiv-sep">:</span>
        <UivUnit value={time.seconds} label="SECS" />
      </div>
    </div>
  );
};

export default FlipClock;
