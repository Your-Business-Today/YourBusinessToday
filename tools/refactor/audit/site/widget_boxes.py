"""A content widget that draws its own box: a catalogue widget whose outer element carries container styling.

Only a container widget (Panel, Modal, Page) draws a box. A table, a heading or a field draws its content and is
composed inside a container by the view — `<Panel><RecordsTable/></Panel>` — so it fits a modal, a panel or a
print sheet unchanged. The widgets measured are the ones that own an element, the ones adoption puts into views.
"""
from __future__ import annotations

import re
from pathlib import Path

from ..source_files import SourceFile
from .markup_tree import Node, buildTree
from .vocabulary import BREAKPOINT_PREFIX, Vocabulary

CONTAINER_WIDGETS_WHEN_UNSET = ["Panel", "Modal", "Page"]
CONTAINER_CLASS_PATTERNS_WHEN_UNSET = [r"^(panel|card)\b", r"^rounded", r"^shadow", r"^max-h-", r"^border(-\d+)?$"]


def containerWidgetsOf(settings: dict) -> set[str]:
    return set(settings.get("containerWidgets", CONTAINER_WIDGETS_WHEN_UNSET))


def containerPatternsOf(settings: dict) -> list[re.Pattern]:
    return [re.compile(pattern) for pattern in settings.get("containerClassPatterns", CONTAINER_CLASS_PATTERNS_WHEN_UNSET)]


def outermostElements(node: Node) -> list[Node]:
    elements: list[Node] = []
    for child in node.children:
        elements += [child] if child.isElement else outermostElements(child)
    return elements


def containerClassesOf(classes: list[str], patterns: list[re.Pattern]) -> list[str]:
    return [name for name in classes if any(pattern.search(BREAKPOINT_PREFIX.sub("", name)) for pattern in patterns)]


def boxDrawnBy(element: Node, containerWidgets: set[str], patterns: list[re.Pattern]) -> str:
    if element.name in containerWidgets:
        return element.name
    return " ".join(containerClassesOf(element.classes, patterns))


def boxFindings(widget: str, view: SourceFile, settings: dict) -> list[dict]:
    containerWidgets, patterns = containerWidgetsOf(settings), containerPatternsOf(settings)
    findings = []
    for element in outermostElements(buildTree("\n".join(view.lines))):
        box = boxDrawnBy(element, containerWidgets, patterns)
        if box:
            findings.append({"widget": widget, "file": view.relative, "line": element.line, "element": element.name, "box": box})
    return findings


def contentWidgetFiles(views: list[SourceFile], vocabulary: Vocabulary, settings: dict) -> dict[str, SourceFile]:
    contentWidgets = (set(vocabulary.everyOwner()) & vocabulary.catalogue) - containerWidgetsOf(settings)
    return {Path(view.relative).stem: view for view in views if Path(view.relative).stem in contentWidgets}


def boxedContentWidgets(views: list[SourceFile], vocabulary: Vocabulary, settings: dict) -> list[dict]:
    files = contentWidgetFiles(views, vocabulary, settings)
    return [row for widget, view in sorted(files.items()) for row in boxFindings(widget, view, settings)]
