"""The doors into the data, as plan steps: each door that writes unchecked, and each check looser than its column."""
from __future__ import annotations

SHOWN_TABLES = 4
CLOSE_THE_DOOR = (
    "Check each value it writes against its column before the write, refusing only what the column cannot hold; "
    "or, if it is not a door or writes nothing its caller supplies, record it in `inputValidation.exemptGlobs`. "
    "The refactor-round skill's *Closing a door* is the method."
)


def tablesNamed(tables: list[str]) -> str:
    extra = f" and {len(tables) - SHOWN_TABLES} more" if len(tables) > SHOWN_TABLES else ""
    return ", ".join(f"`{table}`" for table in tables[:SHOWN_TABLES]) + extra


def unguardedDoorStep(passName: str, door: dict) -> dict:
    return {
        "pass": passName,
        "title": f"Close the door in `{door['file']}`: check what it writes to {tablesNamed(door['tables'])}",
        "detail": CLOSE_THE_DOOR,
    }


def looserLimitStep(passName: str, limit: dict) -> dict:
    return {
        "pass": passName,
        "title": f"Bring `{limit['file']}` line {limit['line']} back to its column",
        "detail": (
            f"It allows `{limit['table']}.{limit['column']}` {limit['validatorLimit']} characters; the column holds "
            f"{limit['columnLimit']}. Read the limit from the schema's statement rather than restating it."
        ),
    }


def doorSteps(passName: str, inputValidation: dict) -> list[dict]:
    offenders = inputValidation.get("offenders", {})
    steps = [looserLimitStep(passName, limit) for limit in offenders.get("looserLimits", [])]
    steps += [unguardedDoorStep(passName, door) for door in offenders.get("unvalidated", [])]
    return steps
