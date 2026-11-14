import type { Role } from '../../features/access/presentation/models';
export const roles: Record<Role,string> = {INTERVENANT:'Intervenant',GESTIONNAIRE:'Gestionnaire',ADMINISTRATEUR_FONCTIONNEL:'Administrateur fonctionnel'};
export const states: Record<string,string> = {ACTIVE:'Active',ARCHIVEE:'Archivée',INSCRITE:'Inscrite',PRESENTE:'Présente',ABSENTE:'Absente',DESISTEE:'Désistée',BROUILLON:'Brouillon',PLANIFIEE:'Planifiée',TERMINEE:'Terminée',ANNULEE:'Annulée'};
export const subdomainMessages={title:'Sous-domaines de compétences',refresh:'Actualiser les sous-domaines',status:'État des sous-domaines',loading:'Chargement des sous-domaines…',empty:'Aucun sous-domaine.',table:'Tableau des sous-domaines',caption:'Sous-domaines et domaines parents, y compris les parents désactivés',pagination:'Pagination des sous-domaines',previous:'Sous-domaines précédents',next:'Sous-domaines suivants'};
export const competencyMessages={title:'Compétences du référentiel',refresh:'Actualiser les compétences',status:'État des compétences',loading:'Chargement des compétences…',empty:'Aucune compétence.',table:'Tableau des compétences',caption:'Compétences et sous-domaines parents, y compris les parents désactivés',pagination:'Pagination des compétences',previous:'Compétences précédentes',next:'Compétences suivantes',create:"Créer une compétence",edit:"Modifier une compétence",disable:"Désactiver une compétence",filter:"Filtrer par sous-domaine parent",allParents:"Tous les sous-domaines",parent:"Sous-domaine parent",chooseParent:"Choisir un sous-domaine actif",labelColumn:"Libellé de la compétence",statusColumn:"Statut de la compétence",parentStatusColumn:"Statut du sous-domaine parent",actions:"Actions",saved:"Compétence enregistrée.",disabled:"Compétence désactivée. Les liens existants sont conservés.",reload:"Recharger la fiche",reloadCompetency:"Recharger la compétence",save:"Enregistrer la compétence",confirmDisable:"Confirmer la désactivation de la compétence",formStatus:"État du formulaire de compétence",disableStatus:"État de la désactivation de la compétence",saving:"Enregistrement en cours…",disabling:"Désactivation en cours…",parentHelp:"Le sous-domaine parent sera fixé à la création.",codeHelp:"64 caractères maximum. Le code est unique parmi toutes les compétences et reste réservé après désactivation.",disableHelp:"La compétence et ses liens historiques restent consultables. Les nouvelles associations seront interdites.",fixedParent:"Fixé à la création.",code:"Code",label:"Libellé",modify:"Modifier",deactivate:"Désactiver",};
export const messages = {
  title:'Pôle formation', login:'Se connecter', logout:'Se déconnecter', username:'Identifiant', password:'Mot de passe',
  loading:'Chargement…', sessions:'Sessions accessibles', empty:'Aucune session accessible pour ce compte.',
  participants:'Participants', noParticipants:'Aucun participant pour cette session.', retry:'Réessayer',
  forbidden:'Vous ne disposez pas des droits nécessaires.', expired:'Votre session a expiré. Connectez-vous à nouveau.',
  network:'Le service est indisponible. Réessayez.', invalidLogin:'Identifiant ou mot de passe incorrect.',
  saved:'Modification enregistrée.', accounts:'Habilitations', confirm:'Confirmer le changement de rôle', cancel:'Annuler',
};

export const explorerMessages={
  title:'Explorer le référentiel',refresh:'Actualiser le référentiel',description:'Parcourir les trois niveaux ou rechercher une compétence. Les éléments désactivés restent visibles.',
  query:'Code ou libellé de compétence',search:'Rechercher les compétences',browse:'Parcourir la hiérarchie',
  help:'Recherche par sous-chaîne sans casse. Le chemin et le statut de chaque niveau sont conservés.',
  status:'État de l’exploration',loading:'Chargement du référentiel…',resultCount:'compétence(s) trouvée(s).',domainCount:'domaine(s).',
  domain:'Domaine',subdomain:'Sous-domaine',competency:'Compétence',hierarchy:'Hiérarchie du référentiel',
  noSubdomains:'Aucun sous-domaine dans ce domaine.',noCompetencies:'Aucune compétence dans ce sous-domaine.',empty:'Aucun domaine dans le référentiel.',
  noResults:'Aucune compétence ne correspond à cette recherche.',results:'Résultats de la recherche',path:'Chemin',retryBranch:'Réessayer le chargement de',
  pagination:'Pagination de',domainPagination:'Pagination des domaines de l’exploration',resultPagination:'Pagination des résultats de recherche',previous:'Page précédente',next:'Page suivante',page:'Page',
};

export const profileMessages={
  "saved": "Profil enregistré.",
  "disabled": "Profil désactivé. Les exigences existantes sont conservées.",
  "title": "Profils d’emploi",
  "create": "Créer un profil",
  "refresh": "Actualiser les profils",
  "status": "État des profils",
  "loading": "Chargement des profils…",
  "empty": "Aucun profil. Créez le premier profil pour structurer le référentiel.",
  "table": "Tableau des profils",
  "caption": "Profils actifs et désactivés",
  "code": "Code",
  "label": "Libellé",
  "state": "Statut",
  "actions": "Actions et historique",
  "modify": "Modifier",
  "deactivate": "Désactiver",
  "requirements": "Exigences de",
  "requirementsLoading": "Chargement des exigences…",
  "requirementsRetry": "Réessayer les exigences",
  "requirementsEmpty": "Aucune exigence.",
  requirementsFilter:'Filtrer les exigences par classification',
  requirementsAll:'Toutes les classifications',
  requirementsResults:'Résultats des exigences',
  requirementsNoMatch:'Aucune exigence pour cette classification.',
  requirementsCount:(visible:number,total:number)=>`${visible} exigence${visible===1?'':'s'} sur ${total}.`,
  "pagination": "Pagination des profils",
  "previous": "Profils précédents",
  "next": "Profils suivants",
  "edit": "Modifier un profil",
  "formStatus": "État du formulaire de profil",
  "saving": "Enregistrement en cours…",
  "reload": "Recharger la fiche",
  "codeHelp": "64 caractères maximum. Code unique sans casse, réservé après désactivation.",
  "description": "Description",
  "cancel": "Annuler",
  "save": "Enregistrer le profil",
  "disable": "Désactiver un profil",
  "disableHelp": "Les exigences existantes restent consultables. Aucune nouvelle exigence ne pourra être ajoutée.",
  "disableStatus": "État de la désactivation",
  "disabling": "Désactivation en cours…",
  "confirmDisable": "Confirmer la désactivation"
};

export const classificationMessages={
 title:'Classifications',create:'Créer une classification',refresh:'Actualiser les classifications',status:'État des classifications',loading:'Chargement des classifications…',empty:'Aucune classification.',table:'Tableau des classifications',caption:'Classifications des exigences',code:'Code',label:'Libellé',order:'Ordre',state:'État',actions:'Actions',modify:'Modifier',edit:'Modifier une classification',pagination:'Pagination des classifications',previous:'Classifications précédentes',next:'Classifications suivantes',formStatus:'État du formulaire de classification',saving:'Enregistrement…',saved:'Classification enregistrée.',reload:'Recharger la fiche',codeHelp:'Code unique sans distinction de casse, conservé après désactivation.',cancel:'Annuler',save:'Enregistrer la classification',active:'Active',activationHelp:'Une classification désactivée reste visible sur les exigences existantes et ne peut plus être choisie pour une nouvelle exigence.'
};

export const requirementMessages={
  add:'Associer une compétence',reclassify:'Reclasser l’exigence',status:'État de l’exigence',loading:'Chargement des choix…',saving:'Enregistrement…',saved:'Exigence enregistrée.',reload:'Recharger les choix et l’exigence',missing:'Cette exigence est introuvable.',current:'Classification actuelle :',search:'Rechercher une compétence par code ou libellé',searchButton:'Rechercher les compétences',competency:'Compétence',classification:'Classification',chooseCompetency:'Choisir une compétence active',chooseClassification:'Choisir une classification active',noCompetencies:'Aucune compétence active pour cette recherche.',noClassifications:'Aucune classification active. Contacter un administrateur fonctionnel.',activeHelp:'Seules les références actives peuvent être choisies. Une compétence ne peut être associée qu’une fois au profil.',save:'Enregistrer l’exigence',cancel:'Annuler',competencyPages:'Pages des compétences disponibles',classificationPages:'Pages des classifications disponibles',previous:'Choix précédents',next:'Choix suivants',inactiveProfile:'Profil désactivé : aucune nouvelle exigence ne peut être créée.'
};

export const formationMessages={
  searchTitle:'Recherche dans le catalogue de formations',searchLabel:'Rechercher une formation par code ou intitulé',searchButton:'Rechercher les formations',clearSearch:'Effacer la recherche',searchHelp:'Recherche par code ou intitulé, sans distinction de casse. Les formations archivées et celles sans session sont incluses.',noResults:'Aucune formation ne correspond à votre recherche.',resultCount:'formation(s) trouvée(s).',
  title:'Formations',create:'Créer une formation',edit:'Modifier une formation',refresh:'Actualiser les formations',status:'État du catalogue de formations',loading:'Chargement des formations…',empty:'Aucune formation. Créez la première formation pour constituer le catalogue.',table:'Tableau des formations',caption:'Catalogue des formations, y compris archivées',code:'Code',label:'Intitulé',state:'État',duration:'Durée indicative (minutes)',objectives:'Objectifs',description:'Description',actions:'Actions et historique',modify:'Modifier',save:'Enregistrer la formation',cancel:'Annuler',saved:'Formation enregistrée.',saving:'Enregistrement…',formStatus:'État du formulaire de formation',reload:'Recharger la formation',codeHelp:'Code unique sans casse, réservé même après archivage. La formation est créée en Brouillon.',durationHelp:'Facultative. Nombre entier de minutes strictement positif.',pagination:'Pagination des formations',previous:'Formations précédentes',next:'Formations suivantes',sessions:'Sessions de',sessionsLoading:'Chargement des sessions…',sessionsEmpty:'Aucune session pour cette formation.',sessionsRetry:'Réessayer les sessions',activate:'Activer',archive:'Archiver',reactivate:'Réactiver',confirm:'Confirmer le changement d’état',transitionStatus:'État du changement de formation',changed:'État de la formation modifié.',archivingHelp:'L’archivage conserve les sessions et participations historiques et bloque toute nouvelle session. La réactivation restera possible.',activationHelp:'L’activation contrôle les champs obligatoires, le code unique et la cohérence de la formation.',activateTitle:'Activer une formation',archiveTitle:'Archiver une formation',reactivateTitle:'Réactiver une formation'
};

export const coverageMessages={
  associatedTitle:'Compétences déjà associées',availableTitle:'Compétences à associer',associatedCount:'compétence(s) associée(s).',availableCount:'compétence(s) disponible(s).',page:'Page',of:'sur',
  title:'Compétences de la formation',help:'Associations pédagogiques sans niveau de maîtrise. Elles ne valident aucune acquisition individuelle.',
  activeHelp:'Une nouvelle association nécessite une formation et une compétence actives. Les liens historiques sont conservés.',
  search:'Rechercher une compétence par code ou libellé',searchButton:'Rechercher les compétences',choose:'Compétence à associer',placeholder:'Choisir une compétence',
  add:'Associer la compétence',saved:'Compétence associée.',empty:'Aucune compétence associée.',noChoices:'Aucune compétence active ne correspond à la recherche.',
  loading:'Chargement des compétences…',saving:'Association en cours…',status:'État des compétences associées',refresh:'Actualiser les compétences',retry:'Réessayer le chargement',close:'Fermer',
  choicesPages:'Pages des compétences disponibles',coveragePages:'Pages des compétences associées',previous:'Page précédente',next:'Page suivante',inactive:'Inactive',
};

export const matchingMessages={
  title:'Formations pertinentes',
  forProfile:(label:string)=>`Formations pertinentes pour ${label}`,
  help:'Formations actives partageant au moins une compétence avec ce profil. Tri par code.',
  loading:'Recherche des formations pertinentes',
  empty:'Aucune formation active ne correspond aux compétences de ce profil.',
  count:(total:number)=>`${total} formation(s) pertinente(s).`,
  refresh:'Actualiser les correspondances',
  retry:'Réessayer la recherche des correspondances',
  previous:'Correspondances précédentes',
  next:'Correspondances suivantes',
  pagination:'Pages des formations pertinentes',
  planned:'Session planifiée',
  noPlanned:'Aucune session planifiée',
};

export const explanationMessages={
  common:'Compétences communes',uncovered:'Besoins non couverts',
  forFormation:(title:string)=>`Compétences communes avec ${title}`,
  help:'Classifications définies dans le profil sélectionné. Aucun niveau de maîtrise individuelle n’est évalué.',
  uncoveredHelp:'Compétences du profil sans aucune formation active associée, sur l’ensemble du catalogue.',
  empty:'Toutes les compétences de ce profil sont couvertes par au moins une formation active, ou le profil ne comporte aucune exigence.',
  count:(total:number)=>`${total} compétence(s).`,classification:'Classification dans le profil',
  inactive:'Inactive',inactiveCompetency:'Compétence inactive',
  loading:'Chargement des compétences du profil',refresh:'Actualiser les compétences affichées',retry:'Réessayer le chargement des compétences',
  previous:'Compétences précédentes',next:'Compétences suivantes',pages:'Pages des compétences du profil',
};

export const sessionMessages={
 finish:'Clôturer la session',completed:'Session terminée.',cancelSession:'Annuler la session',confirmCancel:'Confirmer l’annulation',cancelHelp:'Les créneaux, intervenants et participations seront conservés. La session sera exclue des réalisations.',keepSession:'Conserver la session',cancelled:'Session annulée.',
 instructorsSaved:'Affectations enregistrées.',assignedInstructors:'Intervenants de la session',noAssignedInstructor:'Aucun intervenant affecté.',slotsTitle:'Créneaux de la session',manage:'Gérer les sessions',title:'Sessions de la formation',create:'Créer un brouillon de session',label:'Intitulé de session (obligatoire)',
 capacity:'Capacité (facultative)',capacityHelp:'Laisser vide pour une session sans limite de places.',modalities:'Modalités',
 saved:'Session enregistrée.',planned:'Session planifiée.',slotSaved:'Créneau ajouté.',empty:'Aucune session pour cette formation.',
 createHelp:'La création nécessite une formation active.',loading:'Chargement des sessions…',saving:'Enregistrement…',
 close:'Fermer',reload:'Actualiser les sessions',details:'Ouvrir la session',back:'Retour aux sessions',
 plan:'Planifier la session',slot:'Ajouter un créneau',editSlot:'Modifier ce créneau',editTitle:'Modifier un créneau',saveSlot:'Enregistrer le créneau',cancelSlot:'Annuler la modification',slotUpdated:'Créneau modifié.',conflictTitle:'Conflits de planning',conflictHelp:'Des intervenants ou collaborateurs sont déjà engagés sur ces créneaux. Vous pouvez confirmer ce changement malgré les conflits.',confirmSlot:'Confirmer malgré les conflits',cancelConflict:'Abandonner ce changement',conflictCount:(count:number)=>`Conflit avec ${count} autre(s) session(s).`,start:'Début (obligatoire)',end:'Fin (obligatoire)',offset:'Décalage UTC (obligatoire)',
 timeHelp:'Dates et heures dans le décalage indiqué : Z pour UTC, +01:00 ou +02:00 par exemple. Aucun fuseau du navigateur n’est appliqué. Les créneaux enregistrés sont affichés en UTC.',
 noSlots:'Aucun créneau. Ajoutez un créneau avant de planifier.',unlimited:'Sans limite de places',places:'places',
 noInstructor:'La planification est possible sans intervenant et sans capacité renseignée.',refresh:'Recharger la fiche',status:'État de la gestion des sessions',
};

export const instructorMessages={
 title:'Intervenants',create:'Créer un intervenant',edit:'Modifier un intervenant',modify:'Modifier',disable:'Désactiver',refresh:'Actualiser les intervenants',
 firstName:'Prénom (obligatoire)',lastName:'Nom (obligatoire)',contact:'Coordonnées professionnelles (facultatives)',contactHelp:'Coordonnées professionnelles uniquement, 2000 caractères maximum. Aucun compte utilisateur n’est créé.',
 legacyHelp:'Cette ancienne fiche possède uniquement un nom affiché. Renseignez le prénom et le nom pour la compléter ; ses affectations et son compte lié seront conservés.',
 search:'Rechercher par nom ou prénom',searchTitle:'Recherche des intervenants',searchButton:'Rechercher les intervenants',clear:'Effacer les filtres',activeOnly:'Intervenants actifs uniquement',
 empty:'Aucun intervenant pour ces filtres.',loading:'Chargement des intervenants…',saving:'Enregistrement…',saved:'Fiche intervenant enregistrée.',disabled:'Intervenant désactivé. Affectations et compte lié conservés.',
 active:'Actif',inactive:'Désactivé',state:'Statut',account:'Compte utilisateur',linked:'Compte lié',unlinked:'Sans compte lié',label:'Nom affiché',actions:'Actions',table:'Tableau des intervenants',caption:'Intervenants actifs et désactivés',
 status:'État des intervenants',formStatus:'État du formulaire intervenant',save:'Enregistrer l’intervenant',cancel:'Annuler',reload:'Recharger la fiche',
 disableTitle:'Désactiver un intervenant',disableHelp:'Les affectations historiques et le compte éventuellement lié restent conservés. Les nouvelles affectations seront refusées.',confirmDisable:'Confirmer la désactivation',
 pages:'Pagination des intervenants',previous:'Intervenants précédents',next:'Intervenants suivants',
 sessions:'Sessions affectées',historyTitle:'Sessions de l’intervenant',historyEmpty:'Aucune session affectée à cet intervenant.',historyLoading:'Chargement des affectations…',historyRetry:'Réessayer les affectations',historyPrevious:'Sessions affectées précédentes',historyNext:'Sessions affectées suivantes',historyPages:'Pagination des affectations',close:'Fermer',
};

export const assignmentMessages={
 title:'Gérer la coanimation',remove:'Retirer',help:'Les affectations couvrent tous les créneaux de la session. Décochez un intervenant sélectionné pour le retirer.',
 searchTitle:'Recherche des intervenants à affecter',search:'Rechercher un intervenant actif',searchButton:'Rechercher les intervenants actifs',
 selected:'Intervenants sélectionnés',available:'Intervenants disponibles',emptySelection:'Aucun intervenant sélectionné.',empty:'Aucun intervenant actif pour cette recherche.',
 loading:'Chargement ou enregistrement des affectations…',retry:'Réessayer les intervenants',pages:'Pages des intervenants disponibles',previous:'Intervenants disponibles précédents',next:'Intervenants disponibles suivants',
 save:'Enregistrer les affectations',conflict:(count:number)=>`Conflits avec ${count} autre(s) session(s). Les affectations ne sont pas encore enregistrées.`,confirm:'Confirmer les affectations malgré les conflits',cancel:'Abandonner les affectations',
};

export const collaboratorMessages={
 title:'Collaborateurs',create:'Créer un collaborateur',edit:'Modifier un collaborateur',modify:'Modifier',disable:'Désactiver',refresh:'Actualiser les collaborateurs',
 firstName:'Prénom (obligatoire)',lastName:'Nom (obligatoire)',professionalId:'Identifiant professionnel (obligatoire)',contactHelp:'Identifiant professionnel, nom et prénom requis, 100 caractères maximum chacun. L’identifiant reste réservé après désactivation. Aucun profil d’emploi associé.',
 search:'Rechercher par identifiant, nom ou prénom',searchTitle:'Recherche des collaborateurs',searchButton:'Rechercher les collaborateurs',clear:'Effacer les filtres',activeOnly:'Collaborateurs actifs uniquement',
 empty:'Aucun collaborateur pour ces filtres.',loading:'Chargement des collaborateurs…',saving:'Enregistrement…',saved:'Fiche collaborateur enregistrée.',disabled:'Collaborateur désactivé. Participations conservées.',
 active:'Actif',inactive:'Désactivé',state:'Statut',label:'Nom affiché',actions:'Actions',table:'Tableau des collaborateurs',caption:'Collaborateurs actifs et désactivés',
 status:'État des collaborateurs',formStatus:'État du formulaire collaborateur',save:'Enregistrer le collaborateur',cancel:'Annuler',reload:'Recharger la fiche',
 disableTitle:'Désactiver un collaborateur',disableHelp:'Les participations historiques restent conservées. Les nouvelles inscriptions seront refusées.',confirmDisable:'Confirmer la désactivation',
 pages:'Pagination des collaborateurs',previous:'Collaborateurs précédents',next:'Collaborateurs suivants',
 sessions:'Participations',historyTitle:'Participations du collaborateur',historyEmpty:'Aucune participation pour ce collaborateur.',historyLoading:'Chargement des participations…',historyRetry:'Réessayer les participations',historyPrevious:'Participations précédentes',historyNext:'Participations suivantes',historyPages:'Pagination des participations',close:'Fermer',
};

export const participationMessages={
 title:'Gérer les inscriptions',help:'Une participation par collaborateur et session. Un désistement libère une place ; la réinscription conserve la participation initiale.',
 searchTitle:'Recherche des collaborateurs à inscrire',search:'Rechercher un collaborateur actif',searchButton:'Rechercher les collaborateurs actifs',
 enroll:'Inscrire un collaborateur',choice:'Collaborateur à inscrire (obligatoire)',placeholder:'Choisir un collaborateur',empty:'Aucun collaborateur actif pour cette recherche.',
 pages:'Pages des collaborateurs disponibles',previous:'Collaborateurs disponibles précédents',next:'Collaborateurs disponibles suivants',
 withdraw:'Enregistrer le désistement de',reenroll:'Réinscrire',saved:'Participation enregistrée.',status:'État des inscriptions',loading:'Chargement ou enregistrement des inscriptions…',retry:'Actualiser les choix',
 conflict:(count:number)=>`Conflit avec ${count} autre(s) session(s). La participation n’est pas encore enregistrée.`,confirm:'Confirmer l’inscription malgré les conflits',cancel:'Abandonner l’inscription',
};

export const reportingMessages={
 title:'Pilotage de la formation',help:'Période en UTC : début inclus, fin exclue, selon le premier créneau de chaque session. Les brouillons sans créneau sont exclus si une borne est renseignée. Les formations actives représentent le stock courant global.',
 stock:'Formations actives à ce jour',sessions:'Sessions par état',realized:'Sessions réalisées (Terminées)',participations:'Participations hors sessions annulées',cancelled:'Participations des sessions annulées (hors réalisations)',
 registered:'Inscrites',present:'Présentes',absent:'Absentes',withdrawn:'Désistées',activity:'Activité détaillée',filters:'Filtres du pilotage',from:'Début de période inclus (UTC)',until:'Fin de période exclue (UTC)',state:'État de session',allStates:'Tous les états',
 formation:'Formation',allFormations:'Toutes les formations',formationSearchTitle:'Recherche des formations du pilotage',formationSearch:'Rechercher une formation par code ou intitulé',search:'Rechercher les formations du pilotage',apply:'Appliquer les filtres du pilotage',
 formationPages:'Pages des formations du pilotage',formationPrevious:'Formations du pilotage précédentes',formationNext:'Formations du pilotage suivantes',retryChoices:'Réessayer les formations du pilotage',
 loading:'Chargement du pilotage…',status:'État du pilotage',total:(count:number)=>`${count} session(s) dans les filtres.`,empty:'Aucune session pour ces filtres.',noSlot:'Sans créneau',retry:'Actualiser le pilotage',pages:'Pages de l’activité',previous:'Sessions précédentes',next:'Sessions suivantes',
 close:'Fermer',slots:'Créneaux',instructors:'Intervenants',headcounts:'Effectifs par état',noInstructor:'Aucun intervenant affecté.',
};
