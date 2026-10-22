"""Where a function starts and where it ends: a body closes at its brace, an expression body or a bodiless declaration at its semicolon."""
from __future__ import annotations

from dataclasses import dataclass

from .enclosing_types import TYPE_DECLARATION
from .signatures import isFunctionSignature


def startsFunction(line: str) -> bool:
    return isFunctionSignature(line) and not TYPE_DECLARATION.match(line)


@dataclass
class OpenFunction:
    depth: int
    startLine: int
    enclosingType: str
    hasOpenedBody: bool = False

    def isClosedBy(self, line: str, depthAfterLine: int) -> bool:
        self.hasOpenedBody = self.hasOpenedBody or "{" in line
        if not self.hasOpenedBody:
            return depthAfterLine == self.depth and line.rstrip().endswith(";")
        return depthAfterLine <= self.depth and "}" in line
