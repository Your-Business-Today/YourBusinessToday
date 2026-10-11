"""Which controls in a view carry a label: one inside a `<label>`, or one whose `id` a `<label for>` names."""
from __future__ import annotations

import re

from .markup_tree import Node

LABEL = "label"
LABEL_TARGET = re.compile(r'(?<![\w-])(?:for|htmlFor)\s*=\s*"([^"]*)"')
ELEMENT_ID = re.compile(r'(?<![\w-])id\s*=\s*"([^"]*)"')


def valueOf(pattern: re.Pattern, attributes: str) -> str | None:
    match = pattern.search(attributes)
    return match.group(1) if match else None


def isLabel(node: Node) -> bool:
    return node.isElement and node.name.lower() == LABEL


def everyNode(node: Node):
    for child in node.children:
        yield child
        yield from everyNode(child)


def labelTargets(root: Node) -> set[str]:
    targets = {valueOf(LABEL_TARGET, node.attributes) for node in everyNode(root) if isLabel(node)}
    return targets - {None, ""}


def markLabelled(node: Node, targets: set[str], isInsideLabel: bool) -> None:
    for child in node.children:
        child.isLabelled = isInsideLabel or valueOf(ELEMENT_ID, child.attributes) in targets
        markLabelled(child, targets, isInsideLabel or isLabel(child))


def labelControls(root: Node) -> Node:
    markLabelled(root, labelTargets(root), False)
    return root
