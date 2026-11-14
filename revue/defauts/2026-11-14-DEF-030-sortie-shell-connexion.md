# DEF-030 — Variables sensibles affichées au démarrage d’un shell de connexion

Observé le 2026-11-14 pendant le lancement local de l’application. Les valeurs ne sont pas reproduites dans cette fiche.

## Faits et cause

Une commande de lancement enveloppée dans `/bin/bash -lc` a produit une sortie d’initialisation affichant des variables sensibles déjà présentes dans l’environnement utilisateur, avant les journaux de l’application. Cette sortie provenait de l’initialisation du shell de connexion ; le fichier de profil précis n’a pas été inspecté. L’usage de ce shell avait été repris d’une commande locale précédemment autorisée, sans tenir compte de ses effets de bord. Aucun envoi de ces valeurs vers un service externe n’a été effectué par cette commande.

## Correction et variantes

Les lancements suivants utilisent directement `mise run dev` avec `login:false`, sans shell de connexion imbriqué. La sortie ne contient alors que les journaux attendus de Mise et Java. Aucun profil ni secret utilisateur n’a été modifié. Les commandes d’exécution locale écrites dans les guides du dépôt utilisent déjà `mise run dev` directement ; aucune modification documentaire de ces commandes n’est nécessaire.

## Barrière et prévention

Ne pas réutiliser un shell de connexion pour une simple commande applicative lorsque ses scripts d’initialisation ne sont pas nécessaires. Séparer l’autorisation historique d’une commande de la vérification de ses effets de bord ; lancer Mise directement avec un shell non interactif sans chargement de profil. Ne jamais copier de variables sensibles dans une fiche de défaut ou dans une preuve de tests.
