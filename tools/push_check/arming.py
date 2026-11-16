"""Arming git in a clone: its pre-push hook becomes the kit's, so a push asks the push check before it leaves.

Git keeps its hooks outside what is committed, so each clone is armed where it stands: by this tool whenever it is
run, and by the hook the kit registers for the start of a Claude Code session. A clone that keeps hooks of its own,
in a folder it names with core.hooksPath or as a pre-push file the kit did not write, is left exactly as it is, and
is told the one line that hook needs.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from clone import Clone

HOOK = "pre-push"
KITS_HOOK = Path(__file__).resolve().parent / HOOK
MARK_OF_THE_KITS_HOOK = b"armed by the project-process kit"
NAME_OF_THE_TOOL = b"push_check"
LINE_FOR_AN_OWN_HOOK = 'sh tools/push_check/pre-push "$@" || exit 1'
RUNNABLE = 0o755
NOTHING = b""
NOW_ARMED = "git in this clone now refuses a push of anything the repository's checks have not passed on."


@dataclass(frozen=True)
class Arming:
    isArmed: bool
    notice: str = ""


def arm(clone: Clone) -> Arming:
    try:
        return armingOf(clone)
    except OSError as failure:
        return Arming(isArmed=False, notice=f"git could not be armed in this clone ({failure}), so a push from it is not checked.")


def armingOf(clone: Clone) -> Arming:
    hook = clone.hooksFolder / HOOK
    written = bytesOf(hook)
    isTheClonesOwn = bool(written.strip()) and MARK_OF_THE_KITS_HOOK not in written
    if clone.keepsItsOwnHooks or isTheClonesOwn:
        return armingOfAnOwnHook(hook, written)
    kits = KITS_HOOK.read_bytes()
    if written == kits and os.access(hook, os.X_OK):
        return Arming(isArmed=True)
    hook.parent.mkdir(parents=True, exist_ok=True)
    hook.write_bytes(kits)
    hook.chmod(RUNNABLE)
    return Arming(isArmed=True, notice=NOW_ARMED)


def armingOfAnOwnHook(hook: Path, written: bytes) -> Arming:
    if NAME_OF_THE_TOOL in written:
        return Arming(isArmed=True)
    advice = (
        f"this clone keeps git hooks of its own, which the kit leaves as they are. Until {hook} holds the line "
        f"`{LINE_FOR_AN_OWN_HOOK}`, a push from this clone is not checked. That line reads the pushes git hands "
        "the hook: where the hook reads them as well, give each a copy."
    )
    return Arming(isArmed=False, notice=advice)


def bytesOf(file: Path) -> bytes:
    if not file.is_file():
        return NOTHING
    return file.read_bytes()
