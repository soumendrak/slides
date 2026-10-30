# Part 5: presenter rehearsal guide

Keep the existing 02:16–02:39 slot. Worked numbers are illustrative. The deck's
speaker view (`S`) contains the script for each slide; this is the rehearsal copy.

## 02:16–02:21: connect scores to monitoring

**Opening:** “We fixed TripMate. How will we know if it starts failing again?
Part 4 checked individual bookings. Part 5 watches those checks over time,
detects missing measurements, and measures the resources spent on success.”

Trace → score → aggregate → investigate. An alert calls for action; it does not
repair the agent.

**Four signals:** Point to outcome quality, customer waiting, tool failures, and
token consumption. Advance to ask: “A reversed booking returns OK. Which signal
catches it?” Answer: the booking-matches-request check. An execution success does
not prove the requested outcome occurred. Urgency depends on harm; a single
harmful booking may justify immediate action.

**100-tile grid:** Each P is a score of 1 and each F a score of 0. First advance:
85 ones plus 15 zeroes, divided by 100 scores, gives 85%. Second advance: 85% is
below the example threshold of 90%, so the alert condition is breached.

- Window: which period of matching measurements we examine.
- Threshold: the condition that calls for investigation.
- Evaluation frequency: when the alert service runs that query. This is separate
  from the lookback window and must be observed in rehearsal.
- Score count is the denominator. Unscored requests do not enter this average.
- 90% is chosen for teaching; it is not a production wrong-booking allowance.

**False-alarm table:** “We know that 20 of 1,000 runs are bad. A 95% sensitive
check flags 19 and misses one. Of 980 good runs, a 95% specific check clears 931
but wrongly flags 49.” Advance to the bar: “Only 19 of 68 flags are real failures:
about 28%. There are many more opportunities to falsely flag a good run.”

This hypothetical accuracy is not a benchmark of the workshop evaluator.
Windowing does not repair a biased or inaccurate check. Validate checks against
known examples; inspect rates alongside sample counts and scoring coverage.

## 02:21–02:26: configure the alert

Use a rehearsed project, or explain the labelled configuration guide on the slide.

1. Alerts → New Alert.
2. Select **Scores (boolean)**, average, score `booking_matches_request`.
3. Filter to the same intended TripMate environment and scope as the evaluator.
4. Choose **below 0.9** and an available lookback window. Say that window aloud.
5. Select **Show severity NO_DATA**.
6. Link an existing automation if demonstrating delivery, then save.

“The default substitutes zero when scores are absent. Under our condition, that
can report ALERT even though we measured nothing. NO_DATA preserves the distinction.”

Show severity NO_DATA records the state without notifying. Notify after sustained
NO_DATA is a different mode, useful when scores should keep arriving. It can
notify after a configured delay. A separate low-count alert provides context;
it does not automatically suppress the pass-rate alert.

Attendees can follow the workshop repo's `labs/06-alerts.md`; building the alert
is optional. A notification requires a linked automation, not just a visible
severity. Members can link existing automations; creating one requires an Admin
or Owner. Recheck available plan limits before the session.

## 02:26–02:31: measured failure versus absent measurement

Point across the three examples:

- “85 passes out of 100 scores is a measured 85%.”
- “Zero passes out of 100 scores is a measured zero.”
- “Zero scores gives us no denominator. The rate is unknown.”

Advance to compare missing-as-zero with NO_DATA. “An empty thermometer display
does not mean the temperature is zero.”

For the live demonstration, prepare two alerts querying an empty window, one in
each mode. Verify the states before showing them; existing scores remain in a
rolling window until they age out. Then, if Case 2 is still verified to fail in
the workshop's simulated mode, generate traffic:

```sh
uv run ws load -n 40 --case 2 --guard off
```

Wait for scores and scheduled alert evaluation. Inspect actual results. The
simulator generates controlled incorrect behavior; this is not a measured failure
rate for a real LLM. The score-to-alert mechanism can still be demonstrated.

## 02:31–02:36: audience prediction

Ask about an evaluator that stopped while traces continued, then about no booking
requests arriving. Assume no earlier scores remain in the selected window.

- Default missing-as-zero under the demo condition: **ALERT** in either case.
- Show severity NO_DATA: **NO_DATA** in either case.
- Score count alone cannot distinguish the causes.

Advance to the answer. Compare matching trace counts and scores over the same
scope and period. Traces without scores suggest evaluation delay/failure or
selection/filter problems. No traces could mean no traffic or broken trace
ingestion; compare with request traffic too. Account for sampling and normal
asynchronous processing delay.

“NO_DATA identifies a missing measurement. Another signal helps explain why it
is missing.” Finish the discussion around 02:35; the spare minute covers earlier
explanation.

## 02:36–02:39: resources per success, then recap

“100 attempts use 300,000 tokens. That is 3,000 per attempt. But ten attempts fail.”
Advance: “Only 90 tasks succeed. Those successes cost 300,000 ÷ 90, about 3,333
tokens each, 11% above the per-attempt figure.”

The example treats each attempt as a distinct task and assumes no later retry
rescues a failure. With retries, group attempts by task and count each successful
task once. Include usage from every attempt in the numerator.

Tokens measure usage, not money. For LLM spend, sum usage multiplied by the
applicable price across calls, models and usage types, including separate input,
output and relevant cached-token prices. Tool charges require separate accounting.
Equal token counts do not necessarily imply equal dollar costs.

The workshop's simulated calls do not incur real model-provider charges. Real
provider or evaluator calls, when enabled, are separate sources of actual spend.

**Close:** “Watch whether TripMate succeeds, whether measurements are arriving,
and what each successful task costs.” Allow 30–60 seconds for the recap.

## Before demonstrating live

- Verify score type/name, filters, window, score arrival and alert evaluation timing.
- Verify the synthetic fault case still produces the intended failing score.
- Verify state transitions and notification delivery separately.
- The slides are conceptual figures, not evidence that alerts have been configured in a project.

## Sources

- [Langfuse alerts](https://langfuse.com/docs/observability/features/alerts)
- [Langfuse usage and cost](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [Google SRE: alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
