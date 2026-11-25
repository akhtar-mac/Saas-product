import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  calculateActivityTimes,
  currentActivity,
  hms,
  isIp,
  isYmd,
  istNow,
  normaliseBlockedSite,
  sessionState,
  sniffImageMime,
} from './desktrack-rules.js';

const ev = (event_type: string, created_at: string) => ({ event_type, created_at });

test('activity totals follow the old calculateActivityTimes switch/close rules', () => {
  const t = calculateActivityTimes([
    ev('working_start', '2026-11-13 10:00:00'),
    ev('lunch_start', '2026-11-13 13:00:00'),
    ev('working_start', '2026-11-13 13:45:00'),
    ev('meeting_start', '2026-11-13 15:00:00'),
    ev('outside_start', '2026-11-13 15:30:00'),
    ev('logout', '2026-11-13 16:00:00'),
    ev('lunch_start', '2026-11-13 17:00:00'), // after logout: ignored (old break)
  ]);
  assert.equal(t.working, 3 * 3600 + 75 * 60);
  assert.equal(t.lunch, 45 * 60);
  assert.equal(t.meeting, 30 * 60);
  assert.equal(t.outside, 30 * 60);
});

test('an activity still open at the end of the window is not counted (old behaviour)', () => {
  const t = calculateActivityTimes([
    ev('working_start', '2026-11-13 10:00:00'),
    ev('lunch_start', '2026-11-13 13:00:00'),
  ]);
  assert.equal(t.working, 3 * 3600);
  assert.equal(t.lunch, 0);
});

test('logout before any activity counts nothing; leading logout is skipped', () => {
  assert.deepEqual(calculateActivityTimes([ev('logout', '2026-11-13 09:00:00')]), {
    working: 0,
    lunch: 0,
    meeting: 0,
    outside: 0,
  });
});

test('hms matches PHP gmdate(H:i:s) including the 24h wrap and negatives', () => {
  assert.equal(hms(0), '00:00:00');
  assert.equal(hms(3725), '01:02:05');
  assert.equal(hms(-5), '00:00:00');
  assert.equal(hms(86400 + 61), '00:01:01');
});

test('desktop_report logout display follows the old 4 rules', () => {
  assert.deepEqual(
    sessionState({
      actual_logout_time: '2026-11-13 18:00:00',
      last_screenshot_time: '2026-11-13 18:10:00',
    }),
    { state: 'logged_out', logout_time: '2026-11-13 18:00:00' }
  );
  assert.equal(
    sessionState({ actual_logout_time: null, last_screenshot_time: null }).state,
    'live'
  );
  assert.equal(
    sessionState({
      actual_logout_time: null,
      last_screenshot_time: 'x',
      has_screenshot_after_30min: 1,
    }).state,
    'live'
  );
  assert.deepEqual(
    sessionState({ actual_logout_time: null, last_screenshot_time: '2026-11-13 18:10:00' }),
    {
      state: 'auto_logout',
      logout_time: '2026-11-13 18:10:00',
    }
  );
});

test('current activity is the last *_start, cleared by logout', () => {
  assert.equal(
    currentActivity([ev('working_start', 'a'), ev('idle', 'b'), ev('lunch_start', 'c')]),
    'lunch'
  );
  assert.equal(currentActivity([ev('working_start', 'a'), ev('logout', 'b')]), null);
});

test('screenshot MIME is sniffed from the BLOB like finfo', () => {
  assert.equal(sniffImageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), 'image/jpeg');
  assert.equal(sniffImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d])), 'image/png');
  assert.equal(sniffImageMime(Uint8Array.from([1, 2, 3, 4])), 'application/octet-stream');
  assert.equal(sniffImageMime(null), 'application/octet-stream');
});

test('blocked website stores a host-only domain like the live row www.youtube.com', () => {
  assert.equal(normaliseBlockedSite(' www.youtube.com '), 'www.youtube.com');
  assert.equal(normaliseBlockedSite('https://facebook.com/'), 'facebook.com');
  assert.equal(normaliseBlockedSite('HTTPS://WWW.YouTube.com/watch?v=abc'), 'www.youtube.com');
  assert.equal(normaliseBlockedSite('http://instagram.com'), 'instagram.com');
  assert.equal(normaliseBlockedSite('not a url'), null);
  assert.equal(normaliseBlockedSite('localhost'), null);
  assert.equal(normaliseBlockedSite('youtube'), null);
  assert.equal(normaliseBlockedSite(''), null);
});

test('dates, IPs and IST clock', () => {
  assert.ok(isYmd('2026-11-13'));
  assert.ok(!isYmd('2026-13-01'));
  assert.ok(!isYmd('2026-02-30'));
  assert.ok(isIp('192.168.1.20'));
  assert.ok(!isIp('999.1.1.1'));
  assert.equal(istNow(new Date('2026-11-18T10:00:00Z')), '2026-11-18 15:30:00');
});
