#!/usr/bin/env python3
"""Acceptance test against a built package and real rootless Podman (isolated resources)."""
import http.cookiejar
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request
import uuid

package = Path(sys.argv[1]).resolve()
name = "pole-smoke-" + uuid.uuid4().hex[:10]


def run(*arguments, **kwargs):
    return subprocess.run(arguments, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kwargs)


with tempfile.TemporaryDirectory(prefix="pole-podman-smoke-") as directory:
    root = Path(directory)
    for filename in ("deploy.sh", "init-database.sh", "release.env"):
        shutil.copy(package / filename, root)
    with socket.socket() as port_socket:
        port_socket.bind(("127.0.0.1", 0))
        port = port_socket.getsockname()[1]
    environment = {**os.environ, "INSTANCE_NAME": name, "HTTP_PORT": str(port)}

    def deploy(*arguments):
        return run("bash", str(root / "deploy.sh"), *arguments, env=environment)

    def browser():
        return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    base = f"http://127.0.0.1:{port}"

    def request(client, path, body=None, token=None):
        headers = {}
        if body is not None:
            headers["Content-Type"] = "application/json"
        if token:
            headers[token["headerName"]] = token["token"]
        with client.open(urllib.request.Request(base + path, data=body, headers=headers), timeout=15) as response:
            payload = response.read()
            return response.status, json.loads(payload) if payload else None

    def login():
        client = browser()
        _, token = request(client, "/api/auth/csrf")
        password = (root / "secrets/deployment.admin.password").read_text().strip()
        data = urllib.parse.urlencode({"username": "admin", "password": password}).encode()
        req = urllib.request.Request(base + "/api/auth/login", data=data, headers={
            token["headerName"]: token["token"], "Content-Type": "application/x-www-form-urlencoded"})
        with client.open(req, timeout=15) as response:
            assert response.status == 204
        _, token = request(client, "/api/auth/csrf")
        return client, token

    try:
        deploy("init")
        deploy("load", str(package))
        deploy("up")
        client, token = login()
        status, accounts = request(client, "/api/habilitations/comptes")
        assert status == 200 and len(accounts) == 1, accounts
        status, created = request(client, "/api/referentiels/domaines", json.dumps({
            "code": "SMOKE", "label": "Livraison persistante"}).encode(), token)
        assert status == 201, created
        deploy("backup")
        backup = next((root / "backups").glob("*.dump"))
        assert backup.stat().st_size > 0
        # An update recreates the application while keeping its database and administrator.
        deploy("update")
        client, token = login()
        _, result = request(client, "/api/referentiels/domaines/" + created["id"])
        assert result["label"] == "Livraison persistante", result
        request(client, "/api/referentiels/domaines", json.dumps({
            "code": "AFTER", "label": "Après sauvegarde"}).encode(), token)
        deploy("stop")
        run("podman", "start", name + "-db")
        deploy("restore", str(backup), "--replace-data")
        deploy("up")
        client, _ = login()
        _, result = request(client, "/api/referentiels/domaines")
        assert result["total"] == 1, result
        run("podman", "healthcheck", "run", name + "-app")
        print("OK — chargement hors registre, connexion, création, mise à jour, persistance, sauvegarde et restauration.")
    except subprocess.CalledProcessError as error:
        print(error.stderr.decode(), file=sys.stderr)
        for suffix in ("-app", "-db"):
            logs = subprocess.run(["podman", "logs", "--tail", "40", name + suffix], capture_output=True)
            print(logs.stdout.decode() + logs.stderr.decode(), file=sys.stderr)
        raise
    finally:
        # Only resources created by this isolated test are removed. No development database is touched.
        for suffix in ("-app", "-db"):
            subprocess.run(["podman", "rm", "-f", name + suffix], capture_output=True)
        subprocess.run(["podman", "volume", "rm", name + "-pgdata"], capture_output=True)
        subprocess.run(["podman", "network", "rm", name + "-net"], capture_output=True)
        for key in ("postgres-password", "spring.datasource.password", "deployment.admin.password"):
            subprocess.run(["podman", "secret", "rm", name + "-" + key], capture_output=True)
