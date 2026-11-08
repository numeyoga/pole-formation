import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

class MutationSelectionTest(unittest.TestCase):
    def selected(self, *flags):
        result = subprocess.run([sys.executable, str(ROOT / "backend/check-security-mutations.py"), "--list", *flags], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout.splitlines()

    def test_competencies_selects_only_its_seven_controls(self):
        selected = self.selected("--competencies")
        self.assertEqual(len(selected), 7)
        self.assertTrue(all("competen" in line for line in selected))

    def test_subdomains_still_selects_its_six_controls(self):
        selected = self.selected("--subdomains")
        self.assertEqual(len(selected), 6)
        self.assertTrue(all("subdomain" in line for line in selected))

    def test_default_includes_both_scopes_and_original_security_controls(self):
        selected = self.selected()
        self.assertEqual(len(selected), 30)
        self.assertTrue(any("guessing_another_session" in line for line in selected))

    def test_explorer_selects_only_its_four_controls(self):
        selected = self.selected("--explorer")
        self.assertEqual(len(selected), 4)
        self.assertTrue(all("explorer_search_" in line for line in selected))

    def test_scopes_cannot_be_combined(self):
        result = subprocess.run([sys.executable, str(ROOT / "backend/check-security-mutations.py"), "--list", "--competencies", "--subdomains"], capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)

    def test_classifications_selects_its_three_controls(self):
        selected = self.selected("--classifications")
        self.assertEqual(len(selected), 3)
        self.assertTrue(all("classification" in line for line in selected))
