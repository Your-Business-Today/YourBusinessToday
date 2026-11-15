"""jscpd's report becomes the duplication figures, and a run that wrote no report says what was run and what it said."""
from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

from ..check_result import SKIPPED
from ..checks import duplication, jscpd_command

RULES = {"sourceGlobs": ["**/*.py"], "duplication": {"ignoreGlobs": ["**/node_modules/**"], "minTokens": 50}}
REPOSITORY = Path("/work/repository")
INSTALLED_JSCPD = ["/opt/node/bin/jscpd"]
FETCHED_BY_NPX = ["/opt/node/bin/npx", "--yes", jscpd_command.FETCHED_JSCPD]
ONE_CLONE = {"lines": 32, "firstFile": {"name": "/work/repository/a.py"}, "secondFile": {"name": "/work/repository/b.py"}}
REPORT = {
    "statistics": {"total": {"clones": 1, "duplicatedLines": 32, "lines": 400, "percentage": 8.0}},
    "duplicates": [ONE_CLONE],
}
REGISTRY_REFUSED = "\nnpm error code ECONNREFUSED\nnpm error errno ECONNREFUSED\n"
SAYS_A_BYTE_THAT_IS_NOT_TEXT = "import sys; sys.stderr.buffer.write(b'registry \\xff refused'); sys.exit(3)"
A_FOLDER_THAT_EXISTS = Path(__file__).parent


def writesAReport(command: list[str], **options) -> subprocess.CompletedProcess:
    reportFolder = Path(command[command.index("--output") + 1])
    reportPath = reportFolder / duplication.REPORT_FILE
    reportPath.write_text(json.dumps(REPORT), encoding="utf-8")
    return subprocess.CompletedProcess(command, 0, stdout="", stderr="")


def writesNoReport(exitCode: int, said: str) -> Mock:
    return Mock(return_value=subprocess.CompletedProcess([], exitCode, stdout="", stderr=said))


def checkedWith(command: list[str] | None, run) -> dict:
    with patch.object(duplication, "jscpdCommand", return_value=command), patch.object(subprocess, "run", run):
        return duplication.check(REPOSITORY, RULES)


class AReportBecomesTheFigures(unittest.TestCase):
    def test_the_totals_are_the_summary_and_the_clones_the_hotspots(self):
        measured = checkedWith(INSTALLED_JSCPD, writesAReport)
        self.assertEqual(
            measured["summary"],
            {"clones": 1, "duplicatedLines": 32, "totalLines": 400, "duplicatedPercentage": 8.0},
        )
        self.assertEqual(
            measured["offenders"],
            [{"file": "a.py", "duplicatedLineInstances": 32}, {"file": "b.py", "duplicatedLineInstances": 32}],
        )

    def test_the_rules_follow_the_command_that_was_found_and_it_runs_in_the_repository(self):
        run = Mock(side_effect=writesAReport)
        checkedWith(FETCHED_BY_NPX, run)
        lastCall = run.call_args
        asRun, options = lastCall.args[0], lastCall.kwargs
        self.assertEqual(asRun[:3], FETCHED_BY_NPX)
        self.assertEqual(asRun[asRun.index("--min-tokens") + 1], "50")
        self.assertEqual(options["cwd"], REPOSITORY)


class ARunThatWroteNoReportSaysWhy(unittest.TestCase):
    def test_the_reason_names_the_command_its_exit_and_the_first_thing_it_said(self):
        unmeasured = checkedWith(FETCHED_BY_NPX, writesNoReport(1, REGISTRY_REFUSED))
        fetched = jscpd_command.FETCHED_JSCPD
        self.assertEqual(
            unmeasured["summary"],
            {SKIPPED: f"npx --yes {fetched} wrote no report (exit 1: npm error code ECONNREFUSED)"},
        )

    def test_the_reason_names_no_folder_of_the_machine_that_ran_it(self):
        unmeasured = checkedWith(INSTALLED_JSCPD, writesNoReport(1, REGISTRY_REFUSED))
        self.assertNotIn("/opt/node/bin", unmeasured["summary"][SKIPPED])

    def test_a_run_that_said_nothing_is_reported_as_saying_nothing(self):
        unmeasured = checkedWith(INSTALLED_JSCPD, writesNoReport(3, ""))
        self.assertEqual(unmeasured["summary"], {SKIPPED: "jscpd wrote no report (exit 3: it said nothing)"})

    def test_with_nothing_to_run_nothing_is_run_and_the_reason_says_so(self):
        run = Mock()
        unmeasured = checkedWith(None, run)
        self.assertEqual(unmeasured["summary"], {SKIPPED: jscpd_command.CANNOT_BE_HAD})
        run.assert_not_called()

    def test_a_byte_it_said_that_is_not_text_is_shown_and_never_stops_the_reading(self):
        command = [sys.executable, "-c", SAYS_A_BYTE_THAT_IS_NOT_TEXT]
        with patch.object(duplication, "jscpdCommand", return_value=command):
            unmeasured = duplication.check(A_FOLDER_THAT_EXISTS, RULES)
        self.assertIn("(exit 3: registry \\xff refused)", unmeasured["summary"][SKIPPED])
