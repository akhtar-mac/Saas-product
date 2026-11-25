import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LATE_GRACE_MINUTES,
  countLeaveDays,
  ddmmyyyy,
  holidaySchema,
  hrProfileSchema,
  isValidShiftStart,
  lateMinutes,
  leaveApplySchema,
  markSchema,
  monthRange,
  parseWeeklyOffs,
  resolveStatus,
  shiftEndFor,
  shiftStartOptions,
  summarize,
  time12,
  todayIST,
} from './hrms-core';
import { safePhotoName, sniffImage } from './staff-photos';

describe('shifts', () => {
  it('offers 08:30 to 10:30 every 15 minutes, 9 hours each, inside 08:30–19:30', () => {
    const o = shiftStartOptions();
    expect(o[0]).toBe('08:30');
    expect(o[o.length - 1]).toBe('10:30');
    expect(o).toHaveLength(9);
    expect(shiftEndFor('08:30')).toBe('17:30');
    expect(shiftEndFor('10:30')).toBe('19:30');
  });
  it('rejects starts outside the window or off the 15-minute grid', () => {
    expect(isValidShiftStart('09:30')).toBe(true);
    expect(isValidShiftStart('9:45')).toBe(true);
    expect(isValidShiftStart('08:15')).toBe(false);
    expect(isValidShiftStart('10:45')).toBe(false);
    expect(isValidShiftStart('09:10')).toBe(false);
    expect(isValidShiftStart('nonsense')).toBe(false);
  });
  it('formats 12-hour IST labels', () => {
    expect(time12('09:30')).toBe('09:30 am');
    expect(time12('18:30')).toBe('06:30 pm');
    expect(time12('12:00')).toBe('12:00 pm');
  });
});

describe('late minutes (own shift + grace)', () => {
  it('is 0 inside the grace period', () => {
    expect(lateMinutes('09:30', '09:30', 15)).toBe(0);
    expect(lateMinutes('09:30', '09:45', 15)).toBe(0);
  });
  it('counts from the shift start once past grace', () => {
    expect(lateMinutes('09:30', '09:46', 15)).toBe(16);
    expect(lateMinutes('10:00', '10:50', 15)).toBe(50);
  });
  it('uses each person’s own shift', () => {
    expect(lateMinutes('08:30', '09:00', 15)).toBe(30);
    expect(lateMinutes('10:30', '09:00', 15)).toBe(0);
  });
  it('defaults to a 30-minute grace period', () => {
    expect(DEFAULT_LATE_GRACE_MINUTES).toBe(30);
    expect(lateMinutes('09:30', '10:00')).toBe(0);
    expect(lateMinutes('09:30', '10:01')).toBe(31);
  });
  it('cannot tell without a shift or check-in', () => {
    expect(lateMinutes(null, '10:00')).toBeNull();
    expect(lateMinutes('09:30', null)).toBeNull();
  });
  it('turns present into late and back', () => {
    expect(resolveStatus('present', 20)).toEqual({ status: 'late', late_minutes: 20 });
    expect(resolveStatus('late', 0)).toEqual({ status: 'present', late_minutes: 0 });
    expect(resolveStatus('absent', null)).toEqual({ status: 'absent', late_minutes: null });
    expect(resolveStatus('present', null)).toEqual({ status: 'present', late_minutes: null });
  });
});

describe('leave day counting', () => {
  it('skips Sundays and holidays', () => {
    // 01-12-2026 is a Tuesday; 06-12-2026 a Sunday
    const r = countLeaveDays('2026-12-01', '2026-12-07', { holidays: new Set(['2026-12-03']) });
    expect(r.dates).toEqual(['2026-12-01', '2026-12-02', '2026-12-04', '2026-12-05', '2026-12-07']);
    expect(r.days).toBe(5);
  });
  it('respects custom weekly offs', () => {
    const r = countLeaveDays('2026-12-04', '2026-12-07', { weeklyOffs: ['Saturday', 'Sunday'] });
    expect(r.days).toBe(2);
  });
  it('counts a half day as 0.5', () => {
    expect(countLeaveDays('2026-12-01', '2026-12-01', { halfDay: true }).days).toBe(0.5);
    expect(countLeaveDays('2026-12-06', '2026-12-06', { halfDay: true }).days).toBe(0);
  });
  it('validates leave requests', () => {
    const ok = leaveApplySchema.safeParse({
      leave_type: 'CL',
      from_date: '2026-12-01',
      to_date: '2026-12-02',
      reason: 'Family function',
    });
    expect(ok.success).toBe(true);
    const back = leaveApplySchema.safeParse({
      leave_type: 'CL',
      from_date: '2026-12-03',
      to_date: '2026-12-02',
      reason: 'abc',
    });
    expect(back.success).toBe(false);
    const half = leaveApplySchema.safeParse({
      leave_type: 'SL',
      from_date: '2026-12-01',
      to_date: '2026-12-02',
      is_half_day: true,
      half_day_slot: 'first_half',
      reason: 'Doctor',
    });
    expect(half.success).toBe(false);
    const noslot = leaveApplySchema.safeParse({
      leave_type: 'SL',
      from_date: '2026-12-01',
      to_date: '2026-12-01',
      is_half_day: true,
      reason: 'Doctor',
    });
    expect(noslot.success).toBe(false);
    const badType = leaveApplySchema.safeParse({
      leave_type: 'XX',
      from_date: '2026-12-01',
      to_date: '2026-12-01',
      reason: 'Doctor',
    });
    expect(badType.success).toBe(false);
  });
});

describe('dates and summary', () => {
  it('formats DD-MM-YYYY and month ranges', () => {
    expect(ddmmyyyy('2026-11-25')).toBe('25-11-2026');
    expect(monthRange('2026-02')).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    expect(monthRange('2026-13')).toBeNull();
  });
  it('uses the IST calendar date', () => {
    expect(todayIST(new Date('2026-11-24T19:00:00Z'))).toBe('2026-11-25');
    expect(todayIST(new Date('2026-11-24T18:00:00Z'))).toBe('2026-11-24');
  });
  it('defaults weekly off to Sunday', () => {
    expect(parseWeeklyOffs(null)).toEqual(['Sunday']);
    expect(parseWeeklyOffs('saturday,Sunday')).toEqual(['Saturday', 'Sunday']);
    expect(parseWeeklyOffs('junk')).toEqual(['Sunday']);
  });
  it('summarises present-equivalent days', () => {
    const s = summarize([
      { date: 'a', status: 'present' },
      { date: 'b', status: 'late' },
      { date: 'c', status: 'half_day' },
      { date: 'd', status: 'absent' },
      { date: 'e', status: 'holiday' },
    ]);
    expect(s.present_days).toBe(2.5);
    expect(s.working_days_marked).toBe(4);
    expect(s.attendance_rate).toBe(62.5);
  });
});

describe('input validation', () => {
  it('validates attendance marks', () => {
    expect(
      markSchema.safeParse({
        user_source: 'users',
        user_id: 5,
        date: '2026-11-25',
        status: 'present',
        check_in: '09:40',
      }).success
    ).toBe(true);
    expect(
      markSchema.safeParse({
        user_source: 'users',
        user_id: 5,
        date: '2026-02-30',
        status: 'present',
      }).success
    ).toBe(false);
    expect(
      markSchema.safeParse({ user_source: 'x', user_id: 5, date: '2026-11-25', status: 'present' })
        .success
    ).toBe(false);
    expect(
      markSchema.safeParse({
        user_source: 'users',
        user_id: 5,
        date: '2026-11-25',
        status: 'present',
        check_in: '25:00',
      }).success
    ).toBe(false);
  });
  it('validates holidays and HR shift override', () => {
    expect(
      holidaySchema.safeParse({ holiday_date: '2026-12-25', title: 'Christmas' }).success
    ).toBe(true);
    expect(hrProfileSchema.safeParse({ shift_start: '11:00' }).success).toBe(false);
    expect(hrProfileSchema.safeParse({ shift_start: '10:00', shift_locked: true }).success).toBe(
      true
    );
    expect(hrProfileSchema.safeParse({ employee_code: 'DV 01' }).success).toBe(false);
  });
});

describe('photo checks', () => {
  it('sniffs real image bytes', () => {
    expect(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('.jpg');
    expect(
      sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]))
    ).toBe('.png');
    expect(sniffImage(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'binary'))).toBe('.webp');
    expect(sniffImage(Buffer.from('<?php echo 1; ?>....'))).toBeNull();
    expect(sniffImage(Buffer.from('%PDF-1.7 hello'))).toBeNull();
  });
  it('accepts only plain image file names', () => {
    expect(safePhotoName('sp-u5-1-ab12.jpg')).toBe('sp-u5-1-ab12.jpg');
    expect(safePhotoName('1736161367.jpg')).toBe('1736161367.jpg');
    expect(safePhotoName('../.env')).toBeNull();
    expect(safePhotoName('a/b.jpg')).toBeNull();
    expect(safePhotoName('x.php')).toBeNull();
    expect(safePhotoName('x.svg')).toBeNull();
  });
});
