"""Finds jscpd for the duplication check: the one on PATH, else the one version the kit names, fetched by npx."""
from __future__ import annotations

import shutil

JSCPD = "jscpd"
NPX = "npx"
FETCHED_JSCPD = "jscpd@5.4.3"
CANNOT_BE_HAD = "neither jscpd nor npx is on PATH, so jscpd can be neither run nor fetched"


def jscpdCommand() -> list[str] | None:
    installedJscpd = shutil.which(JSCPD)
    if installedJscpd:
        return [installedJscpd]
    npx = shutil.which(NPX)
    if npx:
        return [npx, "--yes", FETCHED_JSCPD]
    return None
