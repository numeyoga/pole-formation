# DEF-012 — Serveur local conservé après reconstruction du JAR

Date : 2026-11-08. Gravité : 🟠. Statut : corrigé. Erreur de procédure de l’agent lors de US-02.01.

## Faits et cause

L’utilisateur signale que `http://localhost:8080/` ne répond pas correctement. Le contrôle HTTP expire après trois secondes (code 000), tandis que `ss` confirme un serveur Java à l’écoute. Les journaux du processus démarré avant US-02.01 contiennent des `NoClassDefFoundError`, notamment pour `ch.qos.logback.classic.spi.ThrowableProxy`. Plusieurs builds ont remplacé son JAR dans `backend/target` sans redémarrer ce serveur.

L’agent avait validé la nouvelle version avec un autre processus sur 8081, puis arrêté uniquement ce processus de test, laissant l’ancien serveur défaillant sur le port utilisateur. La barrière manquante était le contrôle de l’URL réellement utilisée par l’utilisateur après la livraison. Le remplacement du JAR pendant son utilisation est l’explication probable des erreurs de classes ; le mécanisme interne du chargeur n’a pas été instrumenté.

Le processus ancien est arrêté avec SIGTERM, PostgreSQL est vérifié, puis `mise run dev` relance le JAR reconstruit sur 8080. Vérifications effectives : accueil et assets HTTP 200, connexion gestionnaire 204, consultation de l’API des profils 200. L’application reste démarrée pour la recette.

## Variantes et prévention

`mise.toml` lance directement le JAR de `backend/target` dans `tasks.dev`, et `tasks.build` reconstruit ce même chemin. Les exemples du guide local et de lancement suivent aussi ce cycle. Aucun second serveur du projet ne doit être laissé sur le port de recette pendant les reconstructions.

Le guide local précise désormais l’ordre arrêt → build → redémarrage. La checklist demande de vérifier l’accueil, les assets, la connexion et une API de la fonctionnalité sur le port utilisé par l’utilisateur. La prévention est procédurale ; aucune modification du code applicatif ni nouvelle suite unitaire n’est nécessaire pour ce redémarrage.
