#!/usr/bin/env python3
"""Generate the local progress register from the backlog, Git and explicit evidence."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys

BACKLOG = "docs/functional-baseline-v1.0/reference/backlog-mvp.md"
MANIFEST = "tracking/stories.json"
OUTPUT = "docs/generated/development-progress.md"
STORY = re.compile(r"(?<![\w-])US-\d{2}\.\d{2}(?![\w.])")


class Repository:
    def __init__(self, root, staged=False):
        self.root = root
        self.staged = staged

    def git(self, *args):
        return subprocess.check_output(["git", *args], cwd=self.root, text=True, stderr=subprocess.PIPE).strip()

    def read(self, path):
        if self.staged:
            return self.git("show", f":{path}")
        return (self.root / path).read_text()

    def exists(self, path):
        if not isinstance(path, str) or Path(path).is_absolute() or ".." in Path(path).parts:
            return False
        try:
            self.read(path)
            return True
        except (OSError, subprocess.CalledProcessError):
            return False

    def commit(self, value):
        if not isinstance(value, str) or not re.fullmatch(r"[0-9a-f]{7,40}", value):
            raise ValueError(f"Invalid commit: {value}")
        sha = self.git("rev-parse", "--verify", f"{value}^{{commit}}")
        self.git("merge-base", "--is-ancestor", sha, "HEAD")
        return sha


def load(repo):
    titles = dict(re.findall(r"^### (US-\d{2}\.\d{2}) — (.+)$", repo.read(BACKLOG), re.M))
    if not titles:
        raise ValueError("No stories found in the backlog")
    metadata = json.loads(repo.read(MANIFEST))
    for story, item in metadata.items():
        if story not in titles and not story.startswith("TECH-"):
            raise ValueError(f"Unknown story: {story}")
        if story.startswith("TECH-"):
            titles[story] = item["title"]
        if item["implementation"] not in {"partial", "complete"}:
            raise ValueError(f"Invalid implementation state: {story}")
        if not item.get("code_paths") or any(not isinstance(p, str) or p.startswith("/") or ".." in Path(p).parts for p in item["code_paths"]):
            raise ValueError(f"Missing or invalid code paths: {story}")
        for commit in item.get("commits", []):
            repo.commit(commit)
        if not repo.exists(item["report"]):
            raise ValueError(f"Missing validation report: {story}")
        if not isinstance(item.get("remaining"), list) or not all(isinstance(p, str) for p in item["remaining"]):
            raise ValueError(f"Invalid remaining work: {story}")
        acceptance = item["acceptance"]
        if not isinstance(acceptance.get("required"), bool):
            raise ValueError(f"Invalid acceptance requirement: {story}")
        if not acceptance["required"] and not acceptance.get("reason"):
            raise ValueError(f"Missing acceptance exemption reason: {story}")
        evidence = acceptance.get("evidence")
        if evidence and not repo.exists(evidence):
            raise ValueError(f"Missing human acceptance evidence: {story}")
        if item["implementation"] == "complete":
            repo.commit(item["validated_commit"])
    return titles, metadata


def history(repo, titles, metadata):
    commits = {story: [] for story in titles}
    for line in repo.git("log", "--format=%H %B%x00").split("\0"):
        line = line.strip()
        if not line:
            continue
        sha, _, message = line.partition(" ")
        for story in set(STORY.findall(message)) & titles.keys():
            paths = metadata.get(story, {}).get("code_paths", ["backend/", "frontend/", "api/"])
            if repo.git("diff-tree", "--root", "--no-commit-id", "--name-only", "-r", sha, "--", *paths):
                commits[story].append(sha)
    return commits


def status(repo, item, commits):
    if not item:
        return "En cours" if commits else "Non commencée"
    if item["implementation"] != "complete":
        return "En cours"
    if repo.git("diff", item["validated_commit"], "HEAD", "--", *item["code_paths"]):
        return "À revalider"
    if item["remaining"] and item["acceptance"].get("evidence"):
        return "Validée métier — contrôles restants"
    if item["remaining"] or (item["acceptance"]["required"] and not item["acceptance"].get("evidence")):
        return "À recetter"
    return "Terminée"


def render(repo):
    titles, metadata = load(repo)
    commits = history(repo, titles, metadata)
    head = repo.git("rev-parse", "--short", "HEAD")
    date = repo.git("log", "-1", "--format=%cs")
    lines = ["---", 'title: "Avancement du développement"', "created: 2026-11-08", f"updated: {date}", "status: generated", "type: reference", "---", "", "# Avancement du développement", "", f"Vue générée automatiquement pour HEAD `{head}`. Sources : backlog, historique Git et `tracking/stories.json`.", "", "## Sommaire", "", "- [État des stories](#état-des-stories)", "- [Lecture des statuts](#lecture-des-statuts)", "", "## État des stories", "", "| Story | Besoin | Statut | Commits | Preuve | Reste à faire |", "|---|---|---|---|---|---|"]
    for story, title in sorted(titles.items()):
        item = metadata.get(story)
        shas = list(dict.fromkeys(commits[story] + ([repo.commit(c) for c in item.get("commits", [])] if item else [])))
        phase = status(repo, item, shas)
        proof = f"[Rapport](../{item['report'].removeprefix('docs/')})" if item else "—"
        pending = "; ".join(item["remaining"]) if item else "—"
        if phase == "À revalider":
            pending = "Code modifié depuis la preuve enregistrée. " + pending
        commit_text = ", ".join(f"`{sha[:7]}`" for sha in shas) or "—"
        escape = lambda value: value.replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {story} | {escape(title)} | **{phase}** | {commit_text} | {proof} | {escape(pending) or '—'} |")
    lines += ["", "## Lecture des statuts", "", "- **Non commencée** : aucune preuve de développement enregistrée ni commit identifié.", "- **En cours** : commits identifiés ou fondations partielles ; aucun achèvement déduit du seul commit.", "- **À revalider** : code différent du commit validé. Une nouvelle preuve doit être enregistrée.", "- **À recetter** : implémentation et preuve enregistrées ; validations humaines ou travaux restants explicités.", "- **Validée métier — contrôles restants** : acceptation utilisateur enregistrée ; contrôles techniques ou d’accessibilité encore ouverts.", "- **Terminée** : preuve technique courante, aucun reste à faire, et recette humaine documentée lorsqu’elle est requise.", "", "Le registre ne lance pas les tests et ne déduit pas leur succès. Il compare le code commité à la preuve déclarée ; les modifications locales non commitées ne sont pas une nouvelle livraison. Voir la [référence du suivi](../reference/development-tracking.md).", ""]
    return "\n".join(lines)


def check_message(repo, file):
    titles, _ = load(repo)
    ids = set(STORY.findall(Path(file).read_text()))
    unknown = ids - titles.keys()
    if unknown:
        raise ValueError(f"Unknown stories in commit message: {', '.join(sorted(unknown))}")
    paths = repo.git("diff", "--cached", "--name-only").splitlines()
    if any(path.startswith(("backend/", "frontend/", "api/")) for path in paths) and not ids:
        raise ValueError("Application changes require a story ID in the commit message (e.g. Refs: US-08.01)")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("command", choices=["update", "check", "install", "message"])
    parser.add_argument("--staged", action="store_true")
    parser.add_argument("--file", type=Path)
    args = parser.parse_args()
    repo = Repository(args.root, args.staged)
    if args.command == "message":
        check_message(repo, args.file)
    elif args.command == "check":
        load(repo)
    else:
        if args.command == "install":
            current = subprocess.run(["git", "config", "--get", "core.hooksPath"], cwd=repo.root, text=True, capture_output=True).stdout.strip()
            if current and current != ".githooks":
                raise ValueError(f"Existing hooksPath preserved: {current}; integrate the project hooks explicitly")
            subprocess.run(["git", "config", "--local", "core.hooksPath", ".githooks"], cwd=repo.root, check=True)
        output = repo.root / OUTPUT
        content = render(repo)
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = output.with_suffix(".tmp")
        temporary.write_text(content)
        temporary.replace(output)
        print(f"Progress refreshed: {OUTPUT}")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(f"Progress error: {error}", file=sys.stderr)
        sys.exit(1)
