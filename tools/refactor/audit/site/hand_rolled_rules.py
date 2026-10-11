"""The markup a widget owns: one rule per element, the markup it leaves alone, and the views it does not reach.

A rule with `unlessUnlabelled` leaves alone a control no `<label>` wraps or names — a search box or a table-cell
editor is not a `FormField`, which always draws its label.

A rule applies inside the page layout. A view that declares another layout (`@layout LandingLayout`), or one the
rule's globs name, is outside it — a landing page's `<h1>` is not a `PageHeader` written by hand.
"""
from __future__ import annotations

import re
from dataclasses import dataclass

from ..source_files import matchesAny
from .markup_tree import Node

LAYOUT_DIRECTIVE = re.compile(r"^\s*@layout\s+([\w.]+)", re.MULTILINE)
PAGE_LAYOUT = ""


@dataclass(frozen=True)
class HandRolledRule:
    element: str
    ownedBy: str
    unlessClassPrefixes: tuple[str, ...] = ()
    unlessAttributes: tuple[str, ...] = ()
    unlessLayouts: tuple[str, ...] = ()
    unlessGlobs: tuple[str, ...] = ()
    shouldLeaveOutUnlabelled: bool = False

    def applies(self, node: Node) -> bool:
        hasExemptClass = any(name.startswith(prefix) for name in node.classes for prefix in self.unlessClassPrefixes)
        hasExemptAttribute = any(text in node.attributes for text in self.unlessAttributes)
        isExemptUnlabelled = self.shouldLeaveOutUnlabelled and not node.isLabelled
        return not hasExemptClass and not hasExemptAttribute and not isExemptUnlabelled

    def reaches(self, relative: str, layout: str) -> bool:
        isOtherLayout = layout != PAGE_LAYOUT and layout in self.unlessLayouts
        return not isOtherLayout and not matchesAny(relative, list(self.unlessGlobs))


def handRolledRule(row: dict) -> HandRolledRule:
    return HandRolledRule(
        row["element"].lower(), row["ownedBy"], tuple(row.get("unlessClassPrefixes", [])), tuple(row.get("unlessAttributes", [])),
        tuple(row.get("unlessLayouts", [])), tuple(row.get("unlessGlobs", [])), bool(row.get("unlessUnlabelled", False)),
    )


def layoutOf(text: str) -> str:
    declared = LAYOUT_DIRECTIVE.search(text)
    return declared.group(1).split(".")[-1] if declared else PAGE_LAYOUT
