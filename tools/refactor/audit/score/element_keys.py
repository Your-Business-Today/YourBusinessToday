"""The keys of the score's elements: what rules.json overrides them by, and what the plan's passes claim them by."""
from __future__ import annotations


class ElementKey:
    filesOverLimit = "filesOverLimit"
    worstFile = "worstFile"
    functionsOverLimit = "functionsOverLimit"
    elseBlocks = "elseBlocks"
    duplication = "duplication"
    comments = "comments"
    magicValues = "magicValues"
    orphans = "orphans"
    memberChains = "memberChains"
    deepIndentation = "deepIndentation"
    functionNames = "functionNames"
    predictedFiles = "predictedFiles"
    entityFileCounts = "entityFileCounts"
    tangledConditions = "tangledConditions"
    literalComparisons = "literalComparisons"
    gluedAccessors = "gluedAccessors"
    handRolledWidgets = "handRolledWidgets"
    unvalidatedWrites = "unvalidatedWrites"
