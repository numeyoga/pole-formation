# Revues et défauts — Pôle formation

## Conventions

Les identifiants `DEF-NNN` sont uniques et jamais réutilisés. Gravité : 🔴 perte de données, faille ou exigence obligatoire compromise ; 🟠 défaut circonscrit ; 🟡 amélioration. Statuts : ouvert, en cours, corrigé, écarté, régressé. Une fiche close reste figée ; une régression reçoit une nouvelle fiche.

Le [suivi](suivi.md) contient les statuts courants et la [checklist](checklist-projet.md) les contrôles issus des défauts.

## Index des défauts

| ID | Date | Titre | Barrière manquante | Statut |
|---|---|---|---|---|
| [DEF-001](defauts/2026-11-08-DEF-001-devcontainer.md) | 2026-11-08 | Premier démarrage du devcontainer impossible sous Podman rootless | Construction et smoke test sous utilisateur distant | corrigé (`27679e0`) |
| [DEF-002](defauts/2026-11-08-DEF-002-feedback-habilitations.md) | 2026-11-08 | Libellés et confirmation asynchrone des rôles | Parcours navigateur avec opérations successives | corrigé, inclus dans le commit US-08.01 |
