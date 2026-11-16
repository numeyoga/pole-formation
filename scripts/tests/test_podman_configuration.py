"""Exercise the deployment CLI without creating containers or changing the host."""
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[2] / "deploy/podman/deploy.sh"


class PodmanConfigurationTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        shutil.copy(SOURCE, self.directory)
        (self.directory / "release.env").write_text(
            "RELEASE_APP_IMAGE=localhost/test:example\nRELEASE_DB_IMAGE=docker.io/library/postgres:18-alpine\n"
        )

    def run_cli(self, command, **env):
        return subprocess.run(["bash", str(self.directory / "deploy.sh"), command],
                              env={**os.environ, **env}, capture_output=True, text=True)

    def test_init_generates_private_secrets_and_refuses_to_overwrite_them(self):
        result = self.run_cli("init", INSTANCE_NAME="delivery-test", HTTP_PORT="18089")
        self.assertEqual(result.returncode, 0, result.stderr)
        secret = self.directory / "secrets/deployment.admin.password"
        original = secret.read_text()
        self.assertEqual(len(original.strip()), 48)
        self.assertEqual(secret.stat().st_mode & 0o777, 0o600)
        self.assertNotIn(original.strip(), result.stdout + result.stderr)
        self.assertNotEqual(original, (self.directory / "secrets/spring.datasource.password").read_text())
        self.assertIn("HTTP_PORT=18089", (self.directory / "instance.env").read_text())
        self.assertNotEqual(self.run_cli("init").returncode, 0)
        self.assertEqual(secret.read_text(), original)

    def test_external_http_is_rejected_before_any_container_is_started(self):
        self.assertEqual(self.run_cli("init").returncode, 0)
        config = self.directory / "instance.env"
        config.write_text(config.read_text().replace("BIND_ADDRESS=127.0.0.1", "BIND_ADDRESS=0.0.0.0"))
        result = self.run_cli("up")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("COOKIE_SECURE=true", result.stderr)

    def test_invalid_instance_name_is_rejected_before_creating_files(self):
        result = self.run_cli("init", INSTANCE_NAME="../bad")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.directory / "secrets").exists())
