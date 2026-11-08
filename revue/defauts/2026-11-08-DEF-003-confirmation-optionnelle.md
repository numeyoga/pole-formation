# DEF-003 — Confirmation optionnelle refusée à la désérialisation

Date : 2026-11-08. Gravité : 🟠, opérations locales d’audit refusées à tort, aucune donnée réelle. Statut : corrigé, non commité. Erreur introduite puis corrigée par l’agent pendant US-08.02.

## Faits et reproduction

Les tests HTTP de modification d’un créneau et de réactivation recevaient HTTP 400 au lieu de poursuivre la validation métier lorsque le champ optionnel `confirmConflicts` était absent du JSON. Le contrat le définit comme facultatif, avec une confirmation désactivée par défaut.

Les DTO entrants utilisaient un `boolean` primitif dans des records. Dans la configuration de désérialisation utilisée, son absence n’était pas acceptée. Le même scénario passe après remplacement par `Boolean` et conversion explicite par `Boolean.TRUE.equals(...)` à la frontière HTTP.

## Barrière manquante et correction

La correspondance entre le caractère optionnel du contrat et les types des DTO n’était pas couverte avant les tests d’acceptation. TypeScript et la compilation Java ne prouvent pas cette correspondance. Les tests HTTP avec corps incomplet ont été la barrière effective.

## Recherche de variantes

Les trois DTO de `audit/infrastructure/AuditController.java` étaient concernés : créneau, affectations et transition. Ils sont tous corrigés. Recherche dans les autres contrôleurs : les DTO existants de présence, libellé et rôle n’ont pas ce booléen optionnel ; leurs valeurs nulles font l’objet de validations explicites.

## Validation et prévention

Les scénarios HTTP omettent désormais régulièrement le champ et vérifient le succès nominal, l’avertissement de conflit et le refus de capacité. Une valeur `true` explicite est également testée pour confirmer un conflit. La suite serveur complète passe avec PostgreSQL réel.

Prévention : vérifier les champs optionnels au niveau HTTP, en testant leur absence en plus de leur valeur nominale. Ne pas supposer qu’un type primitif fournit le défaut décrit par le contrat.
