# My first agent observability checklist

Start with one workflow and one mistake that matters to a user. You can complete
the first five steps locally before monitoring live traffic.

**My workflow:** ____________________

**The mistake I want to catch:** ____________________

- [ ] **Record one complete run (a trace).**
  Capture the user's request, model and tool calls, actual results, timing and
  errors. Remove secrets and personal data before exporting.
  **Done when:** I can follow a request from start to finish and see what happened.

- [ ] **Review examples and choose one important failure.**
  Compare the request with the actual outcome. Write plain-language notes about
  problems and group similar mistakes. Include successful examples too.
  **Done when:** I can explain the chosen failure and point to the evidence.

- [ ] **Build and test one clear pass/fail check.**
  Define what passing and failing mean. Prefer code for exact conditions such as
  matching a requested destination. Use a judge when the criterion needs human
  judgment; compare it with expert labels and keep final validation examples
  separate from the examples used to tune it.
  **Done when:** I have tried passing, failing and edge cases and inspected any
  incorrect verdicts. A score alone is not proof that the check is right.

- [ ] **Fix the failure and verify the outcome.**
  For actions such as bookings or payments, validate the relevant inputs before
  acting. Test in a sandbox or with simulated tools. Rerun the failed example and
  check the actual result, not just the final message.
  **Done when:** the incorrect action is prevented and I have checked whether the
  requested task was completed. These are different outcomes.

- [ ] **Save examples and rerun after changes.**
  Keep passing, failing and edge cases as repeatable tests. Run them after changing
  a prompt, model, tool or application code. Add new failures as they are found.
  **Done when:** I can make a change and compare its behavior on the same examples.

- [ ] **Monitor after launch.**
  Watch quality checks, response time and cost per successful task. Read pass rates
  alongside score counts and check how many requests received scores. Decide when
  an alert should ask someone to investigate and what happens if scores disappear.
  **Done when:** I can distinguish a measured failure from a missing measurement
  and know who investigates each condition. Verify any notification actually arrives.

**Remember:** a fluent answer can describe an action that never happened. Check
the recorded outcome against what the user requested.

This is a beginner exercise, not a complete production-readiness checklist. The
workshop's synthetic cases teach the process; they do not measure production
failure rates or real provider charges.

## Workshop references

- [Workshop repository](https://github.com/soumendrak/AI-Agent-Observability)
- [Eval discovery and validation: Hamel Husain and Shreya Shankar](https://hamel.dev/blog/posts/evals-faq/)
- [Langfuse alert configuration and missing-data behavior](https://langfuse.com/docs/observability/features/alerts)
