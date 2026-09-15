import assert from 'node:assert/strict';
import test from 'node:test';
import { scheduleBlockInputSchema, scheduleRuleInputSchema } from '../lib/validators';

test('accepts a valid branch schedule rule', () => {
  const result = scheduleRuleInputSchema.safeParse({ type: 'branch', branchId: crypto.randomUUID(), weekday: 1, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 30, capacity: 1 });
  assert.equal(result.success, true);
});

test('rejects a branch rule without branchId', () => {
  const result = scheduleRuleInputSchema.safeParse({ type: 'branch', weekday: 1, startTime: '08:00', endTime: '14:00', slotDurationMinutes: 30 });
  assert.equal(result.success, false);
});

test('accepts a full-day home block', () => {
  const result = scheduleBlockInputSchema.safeParse({ type: 'home', blockedDate: '2026-12-25' });
  assert.equal(result.success, true);
});

test('rejects a partial block with only one time', () => {
  const result = scheduleBlockInputSchema.safeParse({ type: 'home', blockedDate: '2026-12-25', startTime: '08:00' });
  assert.equal(result.success, false);
});
