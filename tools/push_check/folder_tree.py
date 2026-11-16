"""The working folder as one git tree: what a commit would hold if everything in the folder were committed now.

The tree is built in an index of its own, so the clone's index, and whatever is staged in it, is left exactly as
it was. That index starts from what is staged with nothing remembered about the files on disk, so every file is
read again, and a file changed without its size or its time changing is still seen. A file git ignores is in the
tree only where git already tracks it, as it would be in a commit.
"""
from __future__ import annotations

import os
import shutil
import tempfile
from dataclasses import dataclass
from pathlib import Path

from clone import Clone

INDEX_GIT_WORKS_IN = "GIT_INDEX_FILE"
INDEX = "index"
ADDED = "A"
REMOVED = "D"
END_OF_A_FIELD = "\0"


@dataclass(frozen=True)
class Difference:
    status: str
    path: str


def treeOfTheFolder(clone: Clone) -> str:
    with tempfile.TemporaryDirectory() as scratch:
        environment = {**os.environ, INDEX_GIT_WORKS_IN: str(Path(scratch) / INDEX)}
        startFromWhatIsStaged(clone, environment)
        clone.git("add --all", environment=environment)
        return clone.git("write-tree", environment=environment)


def startFromWhatIsStaged(clone: Clone, environment: dict[str, str]) -> None:
    staged = clone.ownGitPath(INDEX)
    if not staged.exists():
        return
    shutil.copyfile(staged, environment[INDEX_GIT_WORKS_IN])
    stagedTree = clone.git("write-tree", environment=environment)
    clone.git("read-tree", stagedTree, environment=environment)


def differencesBetween(clone: Clone, earlierTree: str, laterTree: str) -> list[Difference]:
    listed = clone.git("diff-tree -r --no-renames --name-status -z", earlierTree, laterTree)
    fields = listed.split(END_OF_A_FIELD)
    return [Difference(status, path) for status, path in zip(fields[0::2], fields[1::2])]
