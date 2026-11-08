# Suivi des constats

| ID | Gravité | Titre | Origine | Où | Statut | Commit / raison | Mis à jour |
|---|---|---|---|---|---|---|---|
| DEF-001 | 🟠 | Premier démarrage du devcontainer impossible sous Podman rootless | [fiche](defauts/2026-11-08-DEF-001-devcontainer.md) | `.devcontainer/` | corrigé | `27679e0` | 2026-11-08 |
| DEF-002 | 🟠 | Libellés et confirmation asynchrone des rôles | [fiche](defauts/2026-11-08-DEF-002-feedback-habilitations.md) | `frontend/src/features/access/components/access-app.ts` | corrigé | Inclus dans le commit `feat: implement access control (US-08.01, DEF-002)` ; quatre parcours Playwright réussis | 2026-11-08 |
| DEF-003 | 🟠 | Confirmation optionnelle refusée à la désérialisation | [fiche](defauts/2026-11-08-DEF-003-confirmation-optionnelle.md) | `backend/src/main/java/fr/intformation/audit/infrastructure/AuditController.java` | corrigé | Inclus dans le commit US-08.02 ; tests HTTP réussis | 2026-11-08 |
| DEF-004 | 🟠 | Option Comptes absente du filtre du journal | [fiche](defauts/2026-11-08-DEF-004-filtre-comptes.md) | `frontend/src/features/audit/components/audit-log.ts` | corrigé | Inclus dans le commit US-08.02 ; parcours de sélection et pagination réussi | 2026-11-08 |
