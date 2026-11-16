"""The shape every check hands back: its name, the figures it took, and the places behind them.

A check that measured nothing says why under SKIPPED in place of its figures. Duplication alone may say it
beside a figure: the one the baseline held, carried forward because this reading could not measure it.
"""
from __future__ import annotations

SKIPPED = "skipped"


def checkResult(name: str, summary: dict, offenders: list | dict) -> dict:
    return {"name": name, "summary": summary, "offenders": offenders}
