"""The shape every check hands back: its name, the figures it took, and the places behind them."""
from __future__ import annotations


def checkResult(name: str, summary: dict, offenders: list | dict) -> dict:
    return {"name": name, "summary": summary, "offenders": offenders}
