# Setting up the workshop evaluators in Langfuse

This guide accompanies the evaluator slides and appendix walkthroughs. It contains setup instructions and copy-ready sources; it does not configure a Langfuse project by itself. The UI flow was checked against the official documentation on 30 October 2026. A particular project's execution still needs rehearsal.

## What you are creating

| Check | Langfuse type | Copy-ready source | Score name |
|---|---|---|---|
| Confirmation starts with “Booked” | Code evaluator, Python | [confirmation_says_booked.py](../assets/evaluators/confirmation_says_booked.py) | `confirmation_says_booked` |
| Actual booking matches the request | Code evaluator, Python | [booking_matches.py](../assets/evaluators/booking_matches.py) | `booking_matches_request` |
| Judge compares requested and actual booking | LLM-as-a-Judge, Boolean | [booking_judge.md](../assets/evaluators/booking_judge.md) | `booking_matches_request_judge` |

- Regex and structured comparisons are both code evaluators. They are not separate Langfuse evaluator categories.
- Keep distinct score names so the methods can be compared on the same observation.
- All three target the same root `tripmate` observation.
- The structured Python source here is a copy of the participant repository's `evals/booking_matches.py`.

## 1. Prepare trace data

Keep `LLM_MODE=fake` in the participant repository. Make sure its normal Langfuse exporter is configured, then generate a baseline and a deliberately broken run:

```bash
uv run ws case 0
uv run ws case 2 --guard off
```

Open each printed trace link and select its root observation named `tripmate`. Confirm it contains:

```text
Input:
  requested.origin
  requested.destination
  requested.date
  message

Output:
  booking.origin       (absent when no booking was completed)
  booking.destination
  booking.date
  booking.pnr
  final_message
```

The root summarizes the whole request. A child `book_flight` observation has a different data shape. A judge does not automatically inspect the other spans in the trace.

## 2. Create the structured code evaluator

1. In the Langfuse project, open **Evaluators → New evaluator**.
2. Choose **Code evaluator**, then **Python**.
3. Replace the template with the whole [booking_matches.py](../assets/evaluators/booking_matches.py) file. Langfuse supplies `EvaluationContext`, `EvaluationResult` and `Score`; do not add application imports.
4. In the sample-observation filters, set **Is Root Observation = true** and **Name = tripmate**.
5. Select a sample root and run the test. Inspect both the Boolean score and its comment.
6. Save after confirming it can read the requested and booking fields. The Python code declares the score name `booking_matches_request` and data type `BOOLEAN`.

This evaluator validates and compares origin, destination and date. Missing or invalid fields fail, including a missing booking. It ignores the success-sounding final message.

Code evaluators read directly from `ctx.observation.input` and `ctx.observation.output`. They do not use the LLM judge's variable-mapping screen. The supplied implementation accepts objects and JSON strings.

## 3. Create the text-regex evaluator

Repeat the Code evaluator → Python flow using [confirmation_says_booked.py](../assets/evaluators/confirmation_says_booked.py). Use the same sample filters.

The score name is `confirmation_says_booked`. It reads `output.final_message` and checks whether it begins with the word `Booked`.

This is intentionally weak. Its true result means the wording matched, not that the booking was correct. The point of the slide-45 comparison is to observe a false positive when a confirmation sounds successful while the actual booking is wrong.

For the different PNR-format example on slide 41, create an optional extra Code evaluator using [pnr_format.py](../assets/evaluators/pnr_format.py). It reads the actual `output.booking.pnr` and returns `pnr_format_valid`. The six-character format is an exercise rule, not a universal airline rule. A valid-looking PNR is not evidence of a correct booking.

## 4. Create the booking LLM judge

1. Open **Settings → LLM Connections**. Configure a provider connection and choose a model that supports structured outputs. Enter credentials in Langfuse, not in these slides or this file.
2. Open **Evaluators → New evaluator → LLM-as-a-Judge** and start with a blank prompt.
3. Copy the System and User messages from [booking_judge.md](../assets/evaluators/booking_judge.md) into their corresponding message roles.
4. Select the connected model, choose **Boolean** scoring and use score name `booking_matches_request_judge`.
5. Map `{{input}}` to the matched observation's whole **Input** and `{{output}}` to its whole **Output**. The prompt reads their nested fields.
6. Filter test samples to **Is Root Observation = true**, **Name = tripmate**. Select representative samples, run the judge, and inspect its verdict and reasoning before saving.

Do not map only `final_message`. The judge needs both requested intent and the actual recorded booking to decide whether the booking matches. The prompt explicitly ignores the confirmation when deciding correctness.

Keep TripMate itself in fake-model mode. The Langfuse worker calls the real judge model through its own LLM Connection. Turning TripMate to `LLM_MODE=openai` is not required and would prevent running the scripted fault cases. Judge calls consume provider tokens even though the agent responses are simulated.

For slide 41's separate tone criterion, optionally create another judge with [tone_judge.md](../assets/evaluators/tone_judge.md). It assesses the reply's tone, not booking accuracy. The rude reply in the poll is a discussion example, not a built-in runnable TripMate case.

## 5. Attach online evaluation rules

An evaluator defines how to score. A rule selects which incoming observations to score. Saving the evaluator alone is not sufficient to score future traffic automatically.

After saving, create a rule from the tested filters, or attach the evaluator to an existing suitable rule. Configure:

| Setting | Workshop value |
|---|---|
| Target | Observations |
| Is Root Observation | true |
| Name | tripmate |
| Sampling | 100% for this small workshop demo |
| Historical data | Leave “Also run on past observations” off initially |
| Evaluators | Attach the three named evaluators above |

The same filters can be used in separate rules if that is clearer in your UI. Avoid assigning the same evaluator twice to overlapping rules for this demonstration. Test on a small amount of traffic first, particularly for the model judge.

Existing observations selected in the test panel are for checking the definition. For persistent scores on old data, use the relevant historical/batch evaluation feature. For this workshop, the simplest path is to enable the online rules and then produce fresh runs.

## 6. Generate fresh traffic and inspect scores

First finish and save the Lab 4 guard implementation in the participant repository. `--rerun` reloads that file and checks the result; it does not implement the missing guard for you.

After the rules are enabled:

```bash
uv run ws case 0
uv run ws case 1 --guard off
uv run ws case 2 --guard off
uv run ws case 2 --rerun
```

Open each root's scores, or the project's Scores view, and compare the distinct score names:

| Score | Case 0 | Case 1 | Case 2 | Corrected rerun |
|---|---|---|---|---|
| `confirmation_says_booked` | true | false | true | true |
| `booking_matches_request` | true | false | false | true |
| `booking_matches_request_judge` | expected true | expected false | expected false | expected true |

These are expected results under the definitions above, not a claim that this project has been configured or that live judge agreement has been measured. Investigate disagreement instead of overwriting the observed result with the expected one.

The regex's true result in Case 2 is a false positive for booking success. The structured evaluator fails a missing booking in Case 1; this does not mean an apology was inappropriate. Task completion and graceful error handling are separate criteria.

The guarded scripted agent rejects the bad booking arguments and retries with the requested route. A correctly implemented guard therefore leads to a correct final booking in this fixture.

## 7. When results do not appear

- **No samples:** verify traces arrived and that the root/name filters match.
- **Missing requested or booking fields:** inspect the selected observation's Input and Output. Pick the root `tripmate` from a fresh run. A missing booking is expected for a genuinely failed booking.
- **Tests work, new traffic is not scored:** verify a rule is enabled, the evaluator is attached, filters match and sampling is 100%. Generate traffic after enabling the rule.
- **Judge cannot save or execute:** check the selected LLM Connection, model's structured-output support and the whole-input/whole-output mappings. On self-hosted Langfuse, the worker needs access to the provider.
- **Code evaluator is unavailable on self-hosting:** the deployment needs a configured code-evaluator dispatcher.
- **Terminal says PASS, but no Langfuse score appears:** the terminal's local check is not proof that the Langfuse rule ran. Inspect Langfuse scores and execution status.
- **Using the SDK scoring fallback:** do not also leave the equivalent online evaluator running without accounting for duplicate scores. The participant repo documents the fallback as `--score sdk` for the structured check.

## Sources

- [Langfuse: code evaluators](https://langfuse.com/docs/evaluation/evaluation-methods/code-evaluators)
- [Langfuse: LLM-as-a-Judge](https://langfuse.com/docs/evaluation/evaluation-methods/llm-as-a-judge)
- [Langfuse: evaluators, rules and scores](https://langfuse.com/docs/evaluation/core-concepts)
- Participant repository: `labs/05-evals.md`, `evals/booking_matches.py`, `evals/judge_prompt.md`, `docs/real-model.md` and `docs/integration-gate.md`.
