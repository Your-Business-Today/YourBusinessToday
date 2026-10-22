"""The names of the audit's checks: the keys its results, the gate, the score and the report all share."""
from __future__ import annotations


class CheckName:
    fileLength = "fileLength"
    functionShape = "functionShape"
    functionNames = "functionNames"
    accessorNames = "accessorNames"
    duplication = "duplication"
    naming = "naming"
    comments = "comments"
    magicValues = "magicValues"
    prose = "prose"
    conditions = "conditions"
    orphans = "orphans"
    designPatterns = "designPatterns"
    inventory = "inventory"
    siteDefinition = "siteDefinition"
    inputValidation = "inputValidation"
    fileAreas = "fileAreas"


CHECKS_IN_REPORT_ORDER = [
    CheckName.fileLength, CheckName.functionShape, CheckName.functionNames, CheckName.accessorNames, CheckName.duplication,
    CheckName.naming, CheckName.comments, CheckName.magicValues, CheckName.prose, CheckName.conditions, CheckName.orphans,
    CheckName.designPatterns, CheckName.inventory, CheckName.siteDefinition, CheckName.inputValidation, CheckName.fileAreas,
]
