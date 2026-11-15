"""The duplication check runs the jscpd on PATH, and where there is none has npx fetch the one version the kit names."""
from __future__ import annotations

import shutil
import unittest
from unittest.mock import patch

from ..checks import jscpd_command

INSTALLED_JSCPD = "/opt/node/bin/jscpd"
INSTALLED_NPX = "/opt/node/bin/npx"
ONE_EXACT_VERSION = r"^jscpd@\d+\.\d+\.\d+$"


def commandWhenPathHolds(installed: dict) -> list[str] | None:
    with patch.object(shutil, "which", installed.get):
        return jscpd_command.jscpdCommand()


class TheDuplicationCheckFindsJscpdForItself(unittest.TestCase):
    def test_the_jscpd_on_path_is_the_one_run(self):
        installed = {jscpd_command.JSCPD: INSTALLED_JSCPD, jscpd_command.NPX: INSTALLED_NPX}
        self.assertEqual(commandWhenPathHolds(installed), [INSTALLED_JSCPD])

    def test_with_no_jscpd_on_path_npx_fetches_the_version_the_kit_names(self):
        installed = {jscpd_command.NPX: INSTALLED_NPX}
        self.assertEqual(commandWhenPathHolds(installed), [INSTALLED_NPX, "--yes", jscpd_command.FETCHED_JSCPD])

    def test_with_neither_on_path_there_is_nothing_to_run(self):
        self.assertIsNone(commandWhenPathHolds({}))

    def test_the_version_fetched_is_one_exact_version(self):
        self.assertRegex(jscpd_command.FETCHED_JSCPD, ONE_EXACT_VERSION)
