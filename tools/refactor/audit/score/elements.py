"""What the score is made of: each element's figures, what they are measured against, where it reaches zero, its weight.

An element scores 100% at no offenders and falls in a straight line to 0% when offenders per unit reach
zeroAt. rules.json may override any weight or zeroAt under score.elements.<key>.
"""
from __future__ import annotations

from .. import figures
from .element_keys import ElementKey

BASELINE, PATTERNS, PROSE, WIDGETS = "Standard baseline checks", "Design pattern file count", "Prose", "Widget adoption"
INPUTS = "Input validation"
FILES_UNIT, FUNCTIONS_UNIT, BRANCHES_UNIT, THOUSAND_LINES_UNIT = "files", "functions", "branches", "thousand lines"
ONE = [figures.ONE]
FILES = [figures.TOTAL_FILES]
FUNCTIONS = [figures.TOTAL_FUNCTIONS]
BRANCHES = [figures.IF_BLOCKS]
THOUSAND_LINES = [figures.TOTAL_LINES]
ORPHAN_CANDIDATES = [figures.COMPONENTS, figures.FUNCTIONS_EXAMINED]
MAGIC_VALUES = [figures.INLINE_HEX_COLOURS, figures.INLINE_STYLE_ATTRIBUTES, figures.REPEATED_STRING_LITERALS]


def element(key: str, label: str, group: str, figures: list, per: list, unit: str, zeroAt: float, weight: int) -> dict:
    return {"key": key, "label": label, "group": group, "figures": figures, "per": per, "unit": unit, "zeroAt": zeroAt, "weight": weight}


ELEMENTS = [
    element(ElementKey.filesOverLimit, "Files over the line limit", BASELINE, [figures.FILES_OVER_LIMIT], FILES, FILES_UNIT, 0.5, 10),
    element(ElementKey.worstFile, "Worst file, in limits over", BASELINE, [figures.WORST_FILE_TIMES_OVER_LIMIT], ONE, "", 9, 5),
    element(ElementKey.functionsOverLimit, "Functions over the line limit", BASELINE, [figures.FUNCTIONS_OVER_LIMIT], FUNCTIONS, FUNCTIONS_UNIT, 0.25, 8),
    element(ElementKey.elseBlocks, "Else blocks", BASELINE, [figures.ELSE_BLOCKS], BRANCHES, BRANCHES_UNIT, 0.5, 5),
    element(ElementKey.duplication, "Duplication %", BASELINE, [figures.DUPLICATED_PERCENTAGE], ONE, "", 20, 8),
    element(ElementKey.comments, "Explanatory comment lines", BASELINE, [figures.EXPLANATORY_COMMENT_LINES], THOUSAND_LINES, THOUSAND_LINES_UNIT, 50, 4),
    element(ElementKey.magicValues, "Inline magic values", BASELINE, MAGIC_VALUES, THOUSAND_LINES, THOUSAND_LINES_UNIT, 20, 4),
    element(ElementKey.orphans, "Orphan components and functions", BASELINE,
            [figures.ORPHAN_COMPONENTS, figures.ORPHAN_FUNCTIONS], ORPHAN_CANDIDATES, "components and functions", 0.1, 4),
    element(ElementKey.memberChains, "Long member chain lines", BASELINE, [figures.LONG_MEMBER_CHAIN_LINES], THOUSAND_LINES, THOUSAND_LINES_UNIT, 30, 4),
    element(ElementKey.deepIndentation, "Deeply indented lines", BASELINE, [figures.DEEPLY_INDENTED_LINES], THOUSAND_LINES, THOUSAND_LINES_UNIT, 30, 4),
    element(ElementKey.functionNames, "Overlong function names", BASELINE, [figures.OVERLONG_FUNCTION_NAMES], FUNCTIONS, FUNCTIONS_UNIT, 0.1, 4),
    element(ElementKey.predictedFiles, "Files the patterns predict but are missing", PATTERNS,
            [figures.PREDICTED_FILES_MISSING], [figures.PREDICTED_FILES], "predicted files", 0.5, 10),
    element(ElementKey.entityFileCounts, "Entities outside their expected file count", PATTERNS,
            [figures.ENTITIES_OUT_OF_RANGE], [figures.ENTITIES], "entities", 0.5, 10),
    element(ElementKey.tangledConditions, "Conditions with calls tangled inside calls", PROSE,
            [figures.TANGLED_CONDITION_LINES], BRANCHES, BRANCHES_UNIT, 0.25, 8),
    element(ElementKey.literalComparisons, "Conditions compared to a raw literal", PROSE, [figures.LITERAL_COMPARISON_LINES], BRANCHES, BRANCHES_UNIT, 0.25, 6),
    element(ElementKey.gluedAccessors, "Accessor names that want to be a property", PROSE, [figures.GLUED_ACCESSOR_NAMES], FUNCTIONS, FUNCTIONS_UNIT, 0.1, 6),
    element(ElementKey.handRolledWidgets, "Markup written by hand where a widget should be", WIDGETS,
            [figures.HAND_ROLLED_ELEMENTS], [figures.WIDGET_SLOTS], "widget slots", 0.5, 8),
    element(ElementKey.unvalidatedWrites, "Doors that write without checking their input against the columns", INPUTS,
            [figures.UNVALIDATED_DOORS, figures.LOOSER_LIMITS], [figures.WRITE_DOORS], "write doors", 0.5, 8),
]


def elementsFor(rules: dict) -> list[dict]:
    overrides = rules.get("score", {}).get("elements", {})
    return [{**row, **overrides.get(row["key"], {})} for row in ELEMENTS]
