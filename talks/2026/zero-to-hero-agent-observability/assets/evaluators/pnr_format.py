"""Optional slide-40 format check. Types are supplied by Langfuse.

The six-character rule is stipulated for this teaching example, not a universal
airline rule. A valid-looking PNR does not establish booking correctness.
"""
import json
import re


def evaluate(ctx: EvaluationContext) -> EvaluationResult:
    output = ctx.observation.output
    if isinstance(output, str):
        try:
            output = json.loads(output)
        except ValueError:
            output = {}
    booking = output.get("booking", {}) if isinstance(output, dict) else {}
    pnr = booking.get("pnr", "") if isinstance(booking, dict) else ""
    passed = isinstance(pnr, str) and re.fullmatch(r"[A-Z0-9]{6}", pnr) is not None
    return EvaluationResult(
        scores=[
            Score(
                name="pnr_format_valid",
                value=passed,
                data_type="BOOLEAN",
                comment="Checks the exercise's six-character PNR format only.",
            )
        ]
    )
