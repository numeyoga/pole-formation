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
  title:'Formations',create:'Créer une formation',edit:'Modifier une formation',refresh:'Actualiser les formations',status:'État du catalogue de formations',loading:'Chargement des formations…',empty:'Aucune formation. Créez la première formation pour constituer le catalogue.',table:'Tableau des formations',caption:'Catalogue des formations, y compris archivées',code:'Code',label:'Intitulé',state:'État',duration:'Durée indicative (minutes)',objectives:'Objectifs',description:'Description',actions:'Actions et historique',modify:'Modifier',save:'Enregistrer la formation',cancel:'Annuler',saved:'Formation enregistrée.',saving:'Enregistrement…',formStatus:'État du formulaire de formation',reload:'Recharger la formation',codeHelp:'Code unique sans casse, réservé même après archivage. La formation est créée en Brouillon.',durationHelp:'Facultative. Nombre entier de minutes strictement positif.',pagination:'Pagination des formations',previous:'Formations précédentes',next:'Formations suivantes',sessions:'Sessions de',sessionsLoading:'Chargement des sessions…',sessionsEmpty:'Aucune session pour cette formation.',sessionsRetry:'Réessayer les sessions',activate:'Activer',archive:'Archiver',reactivate:'Réactiver',confirm:'Confirmer le changement d’état',transitionStatus:'État du changement de formation',changed:'État de la formation modifié.',archivingHelp:'L’archivage conserve les sessions et participations historiques et bloque toute nouvelle session. La réactivation restera possible.',activationHelp:'L’activation contrôle les champs obligatoires, le code unique et la cohérence de la formation.',activateTitle:'Activer une formation',archiveTitle:'Archiver une formation',reactivateTitle:'Réactiver une formation'
};
