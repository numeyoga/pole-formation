"""CLI acceptance tests with real temporary Git repositories; no external packages."""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[2]


class ProgressTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git("init", "-q")
        self.git("config", "user.name", "Progress Test")
        self.git("config", "user.email", "progress@example.invalid")
        self.git("config", "core.hooksPath", ".githooks")
        self.write("docs/functional-baseline-v1.0/reference/backlog-mvp.md", "### US-01.01 — Domaines\n### US-08.01 — Habilitations\n")
        self.write("backend/main.txt", "initial\n")
        self.write("docs/proof.md", "Preuve explicite\n")
        self.write(".gitignore", "docs/generated/\n")
        self.git("add", ".")
        self.git("commit", "-qm", "Initial baseline")
        self.base = self.git("rev-parse", "HEAD").stdout.strip()
        self.item = {
            "implementation": "complete", "commits": [self.base],
            "validated_commit": self.base, "code_paths": ["backend/"],
            "report": "docs/proof.md", "remaining": ["Recette humaine"],
            "acceptance": {"required": True, "evidence": None},
        }
        self.manifest()

    def write(self, path, value):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(value)

    def git(self, *args):
        return subprocess.run(["git", *args], cwd=self.root, text=True, capture_output=True, check=True)

    def manifest(self):
        self.write("tracking/stories.json", json.dumps({"US-08.01": self.item}))

    def cli(self, *args, ok=True):
        result = subprocess.run([sys.executable, str(SOURCE / "scripts/progress.py"), "--root", str(self.root), *args], text=True, capture_output=True)
        self.assertEqual(result.returncode, 0 if ok else 1, result.stdout + result.stderr)
        return result

    def view(self):
        self.cli("update")
        return (self.root / "docs/generated/development-progress.md").read_text()

    def test_all_backlog_stories_are_listed_without_inventing_human_acceptance(self):
        view = self.view()
        self.assertIn("US-01.01 | Domaines | **Non commencée**", view)
        self.assertIn("US-08.01 | Habilitations | **À recetter**", view)
        self.assertIn("Recette humaine", view)
        self.assertEqual(view, self.view())
        self.item["remaining"] = []
        self.manifest()
        self.assertIn("**À recetter**", self.view())
        self.write("docs/acceptance.md", "Validé par le représentant métier, le 2026-11-08\n")
        self.item["acceptance"]["evidence"] = "docs/acceptance.md"
        self.manifest()
        self.assertIn("US-08.01 | Habilitations | **Terminée**", self.view())

    def test_new_commits_are_found_and_changed_code_invalidates_the_proof(self):
        self.write("backend/main.txt", "changed\n")
        self.git("add", ".")
        self.git("commit", "-qm", "Feature US-01.01; related US-08.01")
        view = self.view()
        self.assertIn("US-01.01 | Domaines | **En cours**", view)
        self.assertIn("US-08.01 | Habilitations | **À revalider**", view)
        self.assertIn(self.git("rev-parse", "--short", "HEAD").stdout.strip(), view)

    def test_missing_proof_and_unknown_story_are_errors(self):
        self.item["report"] = "docs/missing.md"
        self.manifest()
        self.assertIn("Missing validation report", self.cli("check", ok=False).stderr)
        self.write("tracking/stories.json", json.dumps({"US-99.99": self.item}))
        self.assertIn("Unknown story", self.cli("check", ok=False).stderr)

    def test_documentation_commit_does_not_claim_a_story_has_started(self):
        self.git("add", ".")
        self.git("commit", "-qm", "docs: plan US-01.01")
        self.assertIn("US-01.01 | Domaines | **Non commencée**", self.view())

    def test_user_acceptance_does_not_erase_unperformed_accessibility_checks(self):
        self.write("docs/acceptance.md", "Accord utilisateur ; lecteur d’écran non testé.\n")
        self.item["acceptance"]["evidence"] = "docs/acceptance.md"
        self.item["remaining"] = ["Essai avec lecteur d’écran"]
        self.manifest()
        view = self.view()
        self.assertIn("**Validée métier — contrôles restants**", view)
        self.assertIn("Essai avec lecteur d’écran", view)

    def test_hooks_refresh_the_ignored_view_without_dirtying_the_repository(self):
        shutil.copytree(SOURCE / "scripts", self.root / "scripts", ignore=shutil.ignore_patterns("__pycache__"))
        shutil.copytree(SOURCE / ".githooks", self.root / ".githooks")
        self.cli("install")
        self.git("add", ".")
        self.git("commit", "-qm", "chore: install progress tracking")
        head = self.git("rev-parse", "--short", "HEAD").stdout.strip()
        self.assertIn(f"HEAD `{head}`", (self.root / "docs/generated/development-progress.md").read_text())
        self.assertEqual(self.git("status", "--porcelain").stdout, "")
        self.git("checkout", "-qb", "progress-test")
        self.assertTrue((self.root / "docs/generated/development-progress.md").exists())

    def test_application_commit_needs_a_known_story_and_staged_metadata_is_checked(self):
        self.write("backend/main.txt", "staged application change\n")
        self.git("add", ".")
        message = self.root / ".git/COMMIT_EDITMSG"
        message.write_text("feat: no story ID")
        self.assertIn("require a story ID", self.cli("message", "--staged", "--file", str(message), ok=False).stderr)
        message.write_text("feat: update US-01.01")
        self.cli("message", "--staged", "--file", str(message))
        message.write_text("feat: update US-99.99")
        self.assertIn("Unknown stories", self.cli("message", "--staged", "--file", str(message), ok=False).stderr)
        self.item["report"] = "docs/missing.md"
        self.manifest()
        self.cli("check", "--staged")
        self.git("add", "tracking/stories.json")
        self.cli("check", "--staged", ok=False)


if __name__ == "__main__":
    unittest.main(verbosity=1)
