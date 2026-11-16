---
title: "Comment livrer et exploiter l’application avec Podman"
created: 2026-11-07
updated: 2026-11-16
status: accepted
type: how-to
---

# Comment livrer et exploiter l’application avec Podman

Installer l’application et PostgreSQL sur une machine Linux avec Podman rootless,
à partir d’un paquet construit sur le poste de développement. La machine cible
utilise Bash, tar et les outils GNU usuels ; Java, Node, Maven, Mise et Compose
ne sont pas nécessaires. Utiliser le même compte Linux pour toutes les commandes
Podman de cette installation. Prévoir initialement 2 CPU, 4 Gio de mémoire et
10 Gio de disque libre, à ajuster aux données, sauvegardes et mesures réelles.

## Sommaire

- [Construire le paquet](#construire-le-paquet)
- [Installer sur la machine cible](#installer-sur-la-machine-cible)
- [Accéder à l’application](#accéder-à-lapplication)
- [Démarrer automatiquement](#démarrer-automatiquement)
- [Sauvegarder et restaurer](#sauvegarder-et-restaurer)
- [Mettre à jour et revenir en arrière](#mettre-à-jour-et-revenir-en-arrière)
- [Diagnostiquer et arrêter](#diagnostiquer-et-arrêter)
- [Préparer une ouverture aux utilisateurs](#préparer-une-ouverture-aux-utilisateurs)

## Construire le paquet

Sur le poste de développement, suivre les [prérequis Mise](local-development.md).
Exécuter les validations applicatives avant la construction ; le script de paquet
ne les exécute pas à votre place :

```bash
mise run test:frontend
mise run test:backend
# Avec l’application locale démarrée et le serveur navigateur disponible :
mise run test:e2e
mise run test:scripts

# Exemple de version ; attribuer une version différente à chaque livraison.
bash scripts/package-podman.sh 0.1.0-recette.1
```

Le script installe les dépendances frontend verrouillées, construit le frontend
et le JAR Maven, construit l’image OCI Java 27, puis exporte l’image applicative
et PostgreSQL 18 dans `dist/pole-formation-0.1.0-recette.1.tar.gz`.
La construction requiert l’accès aux dépôts de dépendances et d’images.
Les images exportées correspondent à l’architecture CPU de construction :
construire sur la même architecture que la cible. Les identifiants exacts des
images et le commit source sont conservés dans le paquet ; `source-changes.txt`
signale les modifications locales non commitées. Livrer de préférence un commit
propre. Aucun secret ni donnée du poste n’est exporté.

## Installer sur la machine cible

Copier l’archive par votre canal habituel, puis sur la cible :

```bash
mkdir -p "$HOME/pole-formation"
tar -xzf pole-formation-0.1.0-recette.1.tar.gz -C "$HOME/pole-formation"
cd "$HOME/pole-formation"
bash deploy.sh init
bash deploy.sh load
bash deploy.sh up
```

`load` vérifie les sommes SHA-256 avant de charger les images ; aucun registre
n’est nécessaire sur la cible. `up` attend PostgreSQL puis le contrôle HTTP de
l’application et échoue si le démarrage ne réussit pas.

Conserver le répertoire d’installation : `instance.env`, `secrets/` et `backups/`
sont propres à la machine. `init` refuse de les écraser. Les mots de passe
aléatoires sont enregistrés dans des fichiers accessibles au seul compte Linux,
puis importés comme secrets Podman. L’administrateur PostgreSQL et le rôle
applicatif ont des mots de passe distincts ; le rôle applicatif n’est pas superutilisateur.
Le volume nommé `pole-formation-pgdata` contient les données. PostgreSQL n’expose
aucun port hôte et ne réutilise pas la base de développement.

## Accéder à l’application

Sur la cible, ouvrir `http://127.0.0.1:8080`. Se connecter avec `admin` et le mot
de passe dans `secrets/deployment.admin.password` (le consulter localement sans
le recopier dans un ticket ou un journal partagé).

Depuis un autre poste, ouvrir un tunnel SSH, par exemple :

```bash
ssh -N -L 18080:127.0.0.1:8080 utilisateur@machine
```

Ouvrir ensuite `http://127.0.0.1:18080`.
L’écoute locale et le tunnel permettent cette première installation en HTTP ;
le cookie Secure est désactivé uniquement dans la configuration de livraison
locale. Le profil `standalone` ne charge aucun compte ni donnée de démonstration.
Le compte administrateur existant et son rôle ne sont pas réinitialisés au
redémarrage. Modifier le fichier secret seul ne change pas son mot de passe en
base. Ce premier mode fournit un administrateur local ; le provisionnement de
comptes supplémentaires et l’identité d’entreprise restent à définir.

Pour un reverse proxy HTTPS, configurer sa destination sur
`127.0.0.1:8080`, régler `COOKIE_SECURE=true` dans `instance.env`, puis exécuter
`bash deploy.sh update`. Si le proxy est sur une autre machine, adapter aussi
`BIND_ADDRESS` et le pare-feu pour autoriser seulement ce proxy. Ne publier le
service aux utilisateurs qu’au travers de HTTPS. Le script refuse une écoute
hors `127.0.0.1` lorsque `COOKIE_SECURE=false`.

## Démarrer automatiquement

Sur une cible Linux avec systemd, installer l’unité utilisateur fournie. Elle
suppose l’installation dans `$HOME/pole-formation` ; adapter ses chemins si besoin.

```bash
mkdir -p "$HOME/.config/systemd/user"
cp pole-formation.service "$HOME/.config/systemd/user/"
systemctl --user daemon-reload
systemctl --user enable --now pole-formation.service
```

Faire activer la persistance du service utilisateur par l’administrateur système :

```bash
sudo loginctl enable-linger "$USER"
```

Vérifier le démarrage après un redémarrage réel de la machine cible. Sans cette
configuration systemd, relancer `bash deploy.sh up` après le redémarrage.
Les conteneurs sont configurés pour redémarrer après une sortie inattendue.

## Sauvegarder et restaurer

Depuis le répertoire d’installation, PostgreSQL démarré :

```bash
bash deploy.sh backup
```

Copier régulièrement les fichiers de `backups/` vers un stockage distinct et
protéger aussi `instance.env` et `secrets/`. La sauvegarde est un dump PostgreSQL
cohérent ; une erreur laisse un fichier `.partial`, qui ne doit pas être utilisé.
Planifier la fréquence et la rétention selon les données réelles.

Pour restaurer, arrêter les écritures et fournir explicitement `--replace-data` :

```bash
bash deploy.sh stop
podman start pole-formation-db
bash deploy.sh restore backups/EXEMPLE.dump --replace-data
bash deploy.sh up
```

Remplacer `EXEMPLE.dump` par une sauvegarde existante. La restauration remplace
le contenu de la base ; elle s’exécute en une transaction. Pour tester la reprise
sur une autre machine, y installer le même paquet, démarrer une base neuve puis
appliquer cette procédure. Vérifier la connexion et les données restaurées.
Ne jamais supprimer le volume pour une mise à jour ou un nettoyage courant.

## Mettre à jour et revenir en arrière

Conserver l’ancien paquet et arrêter les écritures pendant l’intervention.
Extraire le nouveau paquet dans un répertoire temporaire, puis depuis
l’installation existante :

```bash
# Exemple : nouvelle livraison extraite dans /tmp/pole-nouvelle-version.
bash deploy.sh load /tmp/pole-nouvelle-version
cp /tmp/pole-nouvelle-version/{deploy.sh,init-database.sh,release.env,pole-formation.service} .
bash deploy.sh update
```

Ne pas relancer `init`. `update` sauvegarde la base avant de remplacer uniquement
le conteneur applicatif. Flyway applique les migrations au démarrage ; le volume
et les comptes existants restent conservés. Si la sauvegarde échoue, la mise à
jour s’arrête avant l’arrêt de l’application. Les changements de `instance.env`
nécessitent également `update` pour recréer le conteneur.

Pour revenir au code précédent, charger son ancien paquet et reprendre son
`release.env`, puis exécuter `update`. Ce retour n’est valable que si l’ancien
code reste compatible avec le schéma migré. Sinon, arrêter l’application,
restaurer la sauvegarde prise **avant** la migration, reprendre l’ancien paquet
et relancer. Cela perd les écritures intervenues depuis la sauvegarde.

La procédure conserve PostgreSQL 18 et ne remplace pas son conteneur lors d’un
`update`. Pour changer son image ou sa version majeure, prévoir une opération
séparée avec sauvegarde et restauration testées ; changer `release.env` ne met
pas à niveau un conteneur PostgreSQL existant.

## Diagnostiquer et arrêter

```bash
bash deploy.sh status
bash deploy.sh logs
podman logs --tail 100 pole-formation-db
podman healthcheck run pole-formation-app
bash deploy.sh stop
```

Avec le service systemd activé, utiliser `systemctl --user stop pole-formation`
pour un arrêt durable. Les données, secrets et sauvegardes sont conservés.
Le contrôle HTTP vérifie la réponse de l’accueil ; il ne remplace pas une recette
métier ni un contrôle continu de la base. Les journaux restent consultables par
Podman ; prévoir leur rétention lors d’une exploitation durable.

## Préparer une ouverture aux utilisateurs

Avant de charger des données réelles, traiter les [points ouverts](../reference/architecture/open-questions.md)
sur la confidentialité, la conservation et l’identité, terminer la recette humaine,
configurer HTTPS et vérifier une restauration sur la cible.
Ce paquet n’ajoute ni SSO ni haute disponibilité. Les sessions sont locales au
processus : une mise à jour demande aux utilisateurs de se reconnecter.
