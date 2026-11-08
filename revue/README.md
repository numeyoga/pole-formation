# Revues et défauts — Pôle formation

## Conventions

Les identifiants `DEF-NNN` sont uniques et jamais réutilisés. Gravité : 🔴 perte de données, faille ou exigence obligatoire compromise ; 🟠 défaut circonscrit ; 🟡 amélioration. Statuts : ouvert, en cours, corrigé, écarté, régressé. Une fiche close reste figée ; une régression reçoit une nouvelle fiche.

Le [suivi](suivi.md) contient les statuts courants et la [checklist](checklist-projet.md) les contrôles issus des défauts.

## Index des défauts

| ID | Date | Titre | Barrière manquante | Statut |
|---|---|---|---|---|
| [DEF-001](defauts/2026-11-08-DEF-001-devcontainer.md) | 2026-11-08 | Premier démarrage du devcontainer impossible sous Podman rootless | Construction et smoke test sous utilisateur distant | corrigé (`27679e0`) |
| [DEF-002](defauts/2026-11-08-DEF-002-feedback-habilitations.md) | 2026-11-08 | Libellés et confirmation asynchrone des rôles | Parcours navigateur avec opérations successives | corrigé, inclus dans le commit US-08.01 |
| [DEF-003](defauts/2026-11-08-DEF-003-confirmation-optionnelle.md) | 2026-11-08 | Confirmation optionnelle refusée à la désérialisation | Tests HTTP avec champs optionnels absents | corrigé, inclus dans le commit US-08.02 |
| [DEF-004](defauts/2026-11-08-DEF-004-filtre-comptes.md) | 2026-11-08 | Option Comptes absente du filtre du journal | Parcours navigateur avec sélection effective | corrigé, inclus dans le commit US-08.02 |
| [DEF-005](defauts/2026-11-08-DEF-005-etat-dom-natif.md) | 2026-11-08 | Collision d’un état Lit avec HTMLElement.children | TypeScript strict a bloqué le build | corrigé, inclus dans le commit US-01.01 |
