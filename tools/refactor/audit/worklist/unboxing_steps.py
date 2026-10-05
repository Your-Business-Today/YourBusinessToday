"""The unboxing steps of the plan: one per content widget that draws its own box, ahead of adopting it anywhere."""
from __future__ import annotations

from .adoption_steps import ADOPTION


def boxesByWidget(boxed: list[dict]) -> dict[str, list[dict]]:
    byWidget: dict[str, list[dict]] = {}
    for row in boxed:
        byWidget.setdefault(row["widget"], []).append(row)
    return byWidget


def describeBoxes(rows: list[dict]) -> str:
    return ", ".join(f"`{row['file']}:{row['line']}` `<{row['element']}>` drawing `{row['box']}`" for row in rows)


def unboxingStep(widget: str, rows: list[dict]) -> dict:
    return {
        "pass": ADOPTION,
        "title": f"Take the box off `{widget}` so it fits inside any container",
        "detail": (
            f"{describeBoxes(rows)}. A content widget draws only its content; the box belongs to a container widget, so move it "
            f"out of `{widget}` and compose it in each view that relied on it (`<Panel>…</Panel>`), nothing restyled. Listed in "
            "audit.json under details.siteDefinition.offenders.boxedWidgets."
        ),
    }


def unboxingSteps(audit: dict) -> list[dict]:
    boxed = audit["details"].get("siteDefinition", {}).get("offenders", {}).get("boxedWidgets", [])
    return [unboxingStep(widget, rows) for widget, rows in boxesByWidget(boxed).items()]
