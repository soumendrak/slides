# AI agent observability: what you learned in three hours

AI agent observability helps you understand what an agent did, whether it met the
user's request, and how reliably it performs.

## 1. What happened?

A **trace** records the journey from the user's request through the model and
tool calls to the result. Each recorded step is a **span**. Together, they show
the execution you can inspect, including timing and errors.

## 2. Did it do what the user wanted?

An **evaluation**, or **eval**, checks a particular aspect of quality. In TripMate,
we compared the requested booking with the actual booking. A tool can return OK
and still book the wrong trip.

Code checks work well for exact rules. Human review helps discover failures and
define good behavior. AI judges can assess criteria that need judgment, but their
verdicts need validation too.

## 3. Where did it go wrong?

Compare the user's intent with the evidence in the trace. The final message is a
claim about what happened; tool results help you check it.

Find the failing step, fix it, and rerun to verify the outcome. A **guardrail** can
check an action before it happens. Blocking a wrong booking and completing the
requested booking are different outcomes.

## 4. How long did it take, and what did success cost?

The **mean** is the average wait. A **percentile**, such as p95, describes a point
in the ordered response times and helps you see slower experiences that an
average can hide. In our worked percentile examples, we used the nearest-rank
method.

More sequential steps add work and opportunities for delays. Failed attempts and
retries also use resources, so measure cost per successful task as well as cost
per attempt.

## 5. How will we know if it goes wrong again?

Save examples as repeatable tests and rerun them after changes. **Monitoring**
watches live results over time. **Alerts** ask someone to investigate when a
chosen condition is met.

Read pass rates alongside score counts. **ALERT** means an alert condition was
breached. With the appropriate no-data mode, **NO_DATA** means no matching
measurements arrived; it does not prove every request failed.

**The loop to remember: Observe → evaluate → improve → monitor.**

Keep checking the outcome the user wanted.

The workshop's TripMate fault cases were simulated to make the lessons
reproducible. They do not establish a real model's production failure rate or
actual provider spend.
