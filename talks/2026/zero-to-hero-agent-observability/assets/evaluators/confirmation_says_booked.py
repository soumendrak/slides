"""Paste into a Langfuse Python code evaluator. Types are supplied by Langfuse.

An intentionally weak check for the slide-45 comparison. It measures wording,
not whether a booking exists or matches the request.
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
    text = output.get("final_message", "") if isinstance(output, dict) else ""
    passed = isinstance(text, str) and re.match(r"^Booked\b", text) is not None
    return EvaluationResult(
        scores=[
            Score(
                name="confirmation_says_booked",
                value=passed,
                data_type="BOOLEAN",
                comment="Checks wording only; does not verify the booking.",
            )
        ]
    )
