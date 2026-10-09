"""Which type a line of source sits inside, read from the type declarations and the braces above it."""
from __future__ import annotations

import re
from dataclasses import dataclass

TYPE_DECLARATION = re.compile(
    r"^\s*(?:export\s+)?(?:declare\s+)?(?:default\s+)?"
    r"(?:public|private|protected|internal|sealed|static|abstract|partial|\s)*"
    r"\b(?:class|record|struct|interface|enum|type)\s+(\w+)"
)
CONSTRUCTOR_KEYWORDS = {"constructor", "__construct", "__init__", "init"}


@dataclass(frozen=True)
class OpenType:
    name: str
    depthOutside: int


class EnclosingTypes:
    def __init__(self):
        self.openTypes: list[OpenType] = []

    @property
    def innermost(self) -> str:
        return self.openTypes[-1].name if self.openTypes else ""

    def enter(self, line: str, depthBeforeLine: int) -> None:
        declaration = TYPE_DECLARATION.match(line)
        if declaration:
            self.openTypes.append(OpenType(declaration.group(1), depthBeforeLine))

    def leave(self, line: str, depthAfterLine: int) -> None:
        isClosingLine = "}" in line
        while isClosingLine and self.openTypes and depthAfterLine <= self.openTypes[-1].depthOutside:
            self.openTypes.pop()


def isConstructorName(name: str, enclosingType: str) -> bool:
    if not enclosingType:
        return False
    return name == enclosingType or name in CONSTRUCTOR_KEYWORDS
