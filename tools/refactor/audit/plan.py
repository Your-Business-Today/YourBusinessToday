"""Writes this repository's refactoring plan: the steps a refactor follows, in order, from the measured facts.

Usage, from the repository root, after run_audit: python3 -m tools.refactor.audit.plan [repositoryRoot]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from .checks import design_patterns
from .repository_layout import AUDIT_FILE, PLAN_DOCUMENT, PLAN_FILE
from .source_files import loadRules, resolveSourceFiles
from .worklist.adoption_steps import adoptionSteps
from .worklist.function_usage import FunctionUsage
from .worklist.render import renderPlan
from .worklist.steps import breakoutSteps, patternSteps, utilitySteps
from .worklist.sweep_steps import sweepSteps
from .worklist.unboxing_steps import unboxingSteps
from .worklist.targets import describeTarget, worstFiles

RUN_AS_SCRIPT = "__main__"


def buildPlan(repositoryRoot: Path, audit: dict) -> dict:
    rules = loadRules(repositoryRoot)
    sourceFiles = resolveSourceFiles(repositoryRoot, rules)
    usage = FunctionUsage(sourceFiles)
    targets = [describeTarget(sourceFile, rules, usage) for sourceFile in worstFiles(sourceFiles, rules)]
    views = [target for target in targets if target["isView"]]
    others = [target for target in targets if not target["isView"]]
    designPatterns = design_patterns.check(sourceFiles, rules)
    steps = [
        *unboxingSteps(audit),
        *adoptionSteps(audit),
        *breakoutSteps(views),
        *utilitySteps(views, usage.repeatedBodies(rules.get("frameworkHandlers", {})), audit),
        *patternSteps(others, designPatterns),
        *sweepSteps(audit),
    ]
    return {"score": audit["score"]["overall"], "steps": steps, "targets": targets, "designPatterns": designPatterns}


def writePlan(repositoryRoot: Path, audit: dict) -> dict:
    plan = buildPlan(repositoryRoot, audit)
    (repositoryRoot / PLAN_DOCUMENT).write_text(renderPlan(plan))
    (repositoryRoot / PLAN_FILE).write_text(json.dumps(plan, indent=2))
    return plan


def main() -> int:
    repositoryRoot = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    auditPath = repositoryRoot / AUDIT_FILE
    plan = writePlan(repositoryRoot, json.loads(auditPath.read_text()))
    print(f"Wrote tools/refactor/refactor-plan.md: {len(plan['steps'])} steps, in order.")
    return 0


if __name__ == RUN_AS_SCRIPT:
    sys.exit(main())
