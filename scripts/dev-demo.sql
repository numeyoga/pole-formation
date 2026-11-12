-- Jeu fictif de recette locale, compatible US-04.01 et US-04.02.
-- Exécution uniquement sur pole_formation_dev, application arrêtée.
BEGIN;
DO $$ BEGIN IF current_database() <> 'pole_formation_dev' OR current_user <> 'pole_formation' THEN RAISE EXCEPTION 'Réinitialisation réservée à pole_formation_dev / pole_formation'; END IF; END $$;
TRUNCATE access_audit, participation, session_slot, session_instructor, training_session,
    app_account, instructor, collaborator, profile_requirement, formation_competency,
    formation, job_profile, competency_reference, subdomain_reference, domain_reference,
    requirement_classification RESTART IDENTITY;

INSERT INTO domain_reference (id,code,label,active,version) VALUES
('50000000-0000-0000-0000-000000000001','NUM','Numérique et données',true,0),
('75667020-531a-5f18-b3af-2e8e2f64e3d9','PREV','Prévention et sécurité',true,0),
('735b1656-ee81-56f9-9ce7-b3d98601d93f','MAN','Management et coopération',true,0);

INSERT INTO subdomain_reference (id,domain_id,code,label,active,version) VALUES
('87ed2adf-a4f2-5156-829b-b4bc5445896c','50000000-0000-0000-0000-000000000001','DATA','Analyse et qualité des données',true,0),
('7a21ea37-6636-50d1-95af-01cbed11be20','50000000-0000-0000-0000-000000000001','CYBER','Hygiène numérique',true,0),
('f5d92567-a246-5227-9f7e-c3c0c03c41d4','75667020-531a-5f18-b3af-2e8e2f64e3d9','SEC','Sécurité au travail',true,0),
('909c7e22-2bbb-538a-a14b-a4ae20be1519','735b1656-ee81-56f9-9ce7-b3d98601d93f','EQUIPE','Animation d’équipe',true,0),
('1009d0a2-148d-5e30-8edd-cf6da193e99f','735b1656-ee81-56f9-9ce7-b3d98601d93f','ARCHIVES','Pratiques historiques',false,0);

INSERT INTO competency_reference (id,subdomain_id,code,label,active,version) VALUES
('45138c72-1e3e-5585-b190-e4b313596880','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-01','Structurer un tableau de données',true,0),
('bbbf308e-8e7c-5f78-8550-9e984f05d95f','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-02','Contrôler la qualité des données',true,0),
('a4631555-8b43-5457-819d-67c5f973262f','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-03','Nettoyer un jeu de données',true,0),
('67cb03f3-d6f1-52e0-9857-0485df811bc8','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-04','Utiliser les formules de calcul',true,0),
('4fffde97-1d2a-51c5-b6b2-01b05a08593d','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-05','Croiser des sources de données',true,0),
('36461b43-74f2-5461-a79d-26b13ff90ce9','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-06','Construire des indicateurs',true,0),
('a47a4068-c383-5ad7-b4e6-df2e86b2dcf7','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-07','Créer des visualisations lisibles',true,0),
('0d238230-992a-5664-a3ae-1a1382dfafd3','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-08','Interpréter des statistiques descriptives',true,0),
('f30dcca6-7f74-5328-93ec-c55ecadc3a02','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-09','Documenter les données',true,0),
('b8e73e88-7172-5721-b79f-49f99cb28229','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-10','Automatiser un traitement simple',true,0),
('1fee3a1a-6b80-50f4-ac60-dc04ecbccd95','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-11','Protéger les données sensibles',true,0),
('0c20051b-9938-5e15-b678-8e6e1b8e8281','87ed2adf-a4f2-5156-829b-b4bc5445896c','DATA-12','Présenter une analyse',true,0),
('9eafee89-3815-5023-b1dc-29c21f3f12d6','7a21ea37-6636-50d1-95af-01cbed11be20','CYBER-01','Reconnaître une tentative d’hameçonnage',true,0),
('c6526c7b-f02c-50ac-8160-ba086958bce6','f5d92567-a246-5227-9f7e-c3c0c03c41d4','PREV-01','Identifier les risques professionnels',true,0),
('d1be8870-647e-52f7-9fe1-f7ece5382c3b','909c7e22-2bbb-538a-a14b-a4ae20be1519','MAN-01','Animer une réunion d’équipe',true,0),
('0f1adb19-82c9-5d22-9996-8576da796525','1009d0a2-148d-5e30-8edd-cf6da193e99f','LEG-01','Appliquer l’ancienne procédure de compte rendu',false,0);

INSERT INTO requirement_classification (id,code,label,sort_order,active,version) VALUES
('60000000-0000-0000-0000-000000000001','ESSENTIEL','Essentiel',0,true,0),
('603e4593-d9ad-5aae-8915-5d5b8ca68e27','RECOMMANDE','Recommandé',1,true,0),
('7d4de94e-3f50-5cd6-b330-0c581351ea91','HISTORIQUE','Classification historique',2,false,0);

INSERT INTO job_profile (id,code,label,description,active,version) VALUES
('094d03b9-d809-5d2c-81a5-209a4a81307c','ANALYSTE','Analyste de données','Douze compétences de données couvertes ; animation de réunion encore à couvrir.',true,0),
('faa2f6bf-503d-5e27-9d4c-322982d4e74a','COORDINATEUR','Coordinateur d’équipe','Prévention couverte ; animation et procédure historique sans offre active.',true,0),
('038b4801-1fa7-5a16-8069-4ea02238a25a','OBSERVATEUR','Profil sans exigences','Exemple explicite de profil ne comportant encore aucune exigence.',true,0),
('cb87cac4-667a-5326-bc05-1e57360f9cd2','ANCIEN','Ancien profil de coordination','Profil désactivé conservé pour consulter ses exigences historiques.',false,0);

INSERT INTO profile_requirement (id,profile_id,competency_id,classification_id,version) VALUES
('2c17f458-089b-516b-9141-e874ce7eadb2','094d03b9-d809-5d2c-81a5-209a4a81307c','45138c72-1e3e-5585-b190-e4b313596880','60000000-0000-0000-0000-000000000001',0),
('7f3a35d1-06a0-5441-83d5-800e2644280d','094d03b9-d809-5d2c-81a5-209a4a81307c','bbbf308e-8e7c-5f78-8550-9e984f05d95f','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('b7ff3cc9-5c83-5705-aced-bf61863e3998','094d03b9-d809-5d2c-81a5-209a4a81307c','a4631555-8b43-5457-819d-67c5f973262f','60000000-0000-0000-0000-000000000001',0),
('8a9128b4-1f02-5796-9cb1-92adbe6d375c','094d03b9-d809-5d2c-81a5-209a4a81307c','67cb03f3-d6f1-52e0-9857-0485df811bc8','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('772f4788-e2b9-57eb-849f-f485aa6e1e4d','094d03b9-d809-5d2c-81a5-209a4a81307c','4fffde97-1d2a-51c5-b6b2-01b05a08593d','60000000-0000-0000-0000-000000000001',0),
('dc4ae609-eb01-5cd0-86d1-f2b7a9325c0b','094d03b9-d809-5d2c-81a5-209a4a81307c','36461b43-74f2-5461-a79d-26b13ff90ce9','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('e33619aa-649c-597b-ab6e-1558531d58b4','094d03b9-d809-5d2c-81a5-209a4a81307c','a47a4068-c383-5ad7-b4e6-df2e86b2dcf7','60000000-0000-0000-0000-000000000001',0),
('2cc7021b-1fb1-5c30-9a4b-a1ff2e1d27cd','094d03b9-d809-5d2c-81a5-209a4a81307c','0d238230-992a-5664-a3ae-1a1382dfafd3','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('83255b39-1ed7-520e-9aa5-401e788972d1','094d03b9-d809-5d2c-81a5-209a4a81307c','f30dcca6-7f74-5328-93ec-c55ecadc3a02','60000000-0000-0000-0000-000000000001',0),
('6e6412f2-c6fe-5b13-b1fc-bfba52d9848d','094d03b9-d809-5d2c-81a5-209a4a81307c','b8e73e88-7172-5721-b79f-49f99cb28229','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('3f3f61d2-66e1-5c28-a038-6e056c6a5b6f','094d03b9-d809-5d2c-81a5-209a4a81307c','1fee3a1a-6b80-50f4-ac60-dc04ecbccd95','60000000-0000-0000-0000-000000000001',0),
('4197774e-f919-56c8-8234-f28b1b155707','094d03b9-d809-5d2c-81a5-209a4a81307c','0c20051b-9938-5e15-b678-8e6e1b8e8281','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('daca7693-8c73-5b72-bfa4-11b6426e939d','094d03b9-d809-5d2c-81a5-209a4a81307c','d1be8870-647e-52f7-9fe1-f7ece5382c3b','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('27cd0e86-beb7-56fc-adac-f8f766fe5b14','faa2f6bf-503d-5e27-9d4c-322982d4e74a','c6526c7b-f02c-50ac-8160-ba086958bce6','60000000-0000-0000-0000-000000000001',0),
('1aead8b1-575f-57d4-951a-d6c9a0b42fa4','faa2f6bf-503d-5e27-9d4c-322982d4e74a','d1be8870-647e-52f7-9fe1-f7ece5382c3b','603e4593-d9ad-5aae-8915-5d5b8ca68e27',0),
('70e45a50-7415-5d58-b7d1-5f8b6ecdafb9','faa2f6bf-503d-5e27-9d4c-322982d4e74a','0f1adb19-82c9-5d22-9996-8576da796525','7d4de94e-3f50-5cd6-b330-0c581351ea91',0),
('93d1bc4e-58d0-5fc0-a896-278ed437caeb','cb87cac4-667a-5326-bc05-1e57360f9cd2','0f1adb19-82c9-5d22-9996-8576da796525','7d4de94e-3f50-5cd6-b330-0c581351ea91',0);

INSERT INTO formation (id,code,title,objectives,description,duration_minutes,state,version) VALUES
('eb5c6957-b178-55c8-95cc-4f48c8293a52','F-DATA-00','Panorama de l’analyse de données','Parcourir les douze compétences du profil analyste.','Formation transversale : douze compétences communes, deux classifications et une seule ligne de résultat.',420,'ACTIVE',0),
('f640c937-8475-57bf-85db-b9e0b1cdd5a8','F-DATA-01','Structurer un tableau de données — atelier','Mettre en pratique : structurer un tableau de données.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('f2854951-d000-5606-b263-1a4678b44a1b','F-DATA-02','Contrôler la qualité des données — atelier','Mettre en pratique : contrôler la qualité des données.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('5e1abd91-9ef2-5731-9c96-d84551112305','F-DATA-03','Nettoyer un jeu de données — atelier','Mettre en pratique : nettoyer un jeu de données.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('fad4bb0c-e890-5b74-a50e-6c1e32ef1ffd','F-DATA-04','Utiliser les formules de calcul — atelier','Mettre en pratique : utiliser les formules de calcul.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('00be4f16-d2ae-5cd0-87ca-195823569820','F-DATA-05','Croiser des sources de données — atelier','Mettre en pratique : croiser des sources de données.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('a0db83b8-b718-5dbe-aab1-db305836732e','F-DATA-06','Construire des indicateurs — atelier','Mettre en pratique : construire des indicateurs.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('fc3db0fa-4eb3-5efc-89ab-66095903bd0a','F-DATA-07','Créer des visualisations lisibles — atelier','Mettre en pratique : créer des visualisations lisibles.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('b3d7aff0-090d-576d-826a-e7b3ba2af90c','F-DATA-08','Interpréter des statistiques descriptives — atelier','Mettre en pratique : interpréter des statistiques descriptives.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('652d628e-625c-56e8-bfa6-2e99d6fe7080','F-DATA-09','Documenter les données — atelier','Mettre en pratique : documenter les données.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('2ebe991d-6d70-528c-96e6-b00318cbae21','F-DATA-10','Automatiser un traitement simple — atelier','Mettre en pratique : automatiser un traitement simple.','Atelier spécialisé fictif. Sans session planifiée sauf l’atelier 01.',90,'ACTIVE',0),
('87d1c2b6-ba6e-5516-9cdc-6fbb5c1446ac','F-PREV-01','Prévenir les risques professionnels','Identifier les situations à risque et les mesures de prévention.','Formation active avec une session planifiée.',180,'ACTIVE',0),
('2660e1a8-7f4c-54fa-88c0-202928eacac9','F-MAN-ARCH','Animation d’équipe — ancienne offre','Animer une réunion et produire un compte rendu.','Offre archivée : associations historiques conservées, exclue des correspondances actives.',120,'ARCHIVEE',0),
('caaab5c4-8e5e-534c-93ca-51c1eff165f5','F-DATA-ARCH','Analyse de données — édition précédente','Structurer un tableau de données.','Ancienne édition archivée avec une session terminée.',120,'ARCHIVEE',0),
('7c89917f-7d08-5f0e-939d-0aa2f3f0b4b3','F-MAN-DRAFT','Animation d’équipe — offre en préparation','Préparer une nouvelle offre de management.','Brouillon sans association : ne couvre encore aucun besoin.',NULL,'BROUILLON',0);

INSERT INTO formation_competency (id,formation_id,competency_id) VALUES
('26a60a3a-3ab0-587b-a57a-a28157b57ab0','eb5c6957-b178-55c8-95cc-4f48c8293a52','45138c72-1e3e-5585-b190-e4b313596880'),
('602d4c12-506e-5da4-a911-e29da57606ef','eb5c6957-b178-55c8-95cc-4f48c8293a52','bbbf308e-8e7c-5f78-8550-9e984f05d95f'),
('e8affdab-6e70-59f8-802f-0aa597bde595','eb5c6957-b178-55c8-95cc-4f48c8293a52','a4631555-8b43-5457-819d-67c5f973262f'),
('703014f1-994c-5c29-a5cb-1b8de3ff1147','eb5c6957-b178-55c8-95cc-4f48c8293a52','67cb03f3-d6f1-52e0-9857-0485df811bc8'),
('e545d7f9-0542-5e5d-975e-34b1f86800ad','eb5c6957-b178-55c8-95cc-4f48c8293a52','4fffde97-1d2a-51c5-b6b2-01b05a08593d'),
('f21f2c38-3fa6-541c-8922-63e29ebe65c2','eb5c6957-b178-55c8-95cc-4f48c8293a52','36461b43-74f2-5461-a79d-26b13ff90ce9'),
('a9e92ae7-1232-5a70-adc4-fab2ce53c521','eb5c6957-b178-55c8-95cc-4f48c8293a52','a47a4068-c383-5ad7-b4e6-df2e86b2dcf7'),
('64cd0db4-a8c4-585f-8eb6-efc863f90018','eb5c6957-b178-55c8-95cc-4f48c8293a52','0d238230-992a-5664-a3ae-1a1382dfafd3'),
('1519f024-3ca9-5111-b82e-db108f6ffdfb','eb5c6957-b178-55c8-95cc-4f48c8293a52','f30dcca6-7f74-5328-93ec-c55ecadc3a02'),
('53cebe2d-6f63-5ecb-a097-f74a92348dad','eb5c6957-b178-55c8-95cc-4f48c8293a52','b8e73e88-7172-5721-b79f-49f99cb28229'),
('eae804b9-a616-5c2e-9fd0-4144d06ee17a','eb5c6957-b178-55c8-95cc-4f48c8293a52','1fee3a1a-6b80-50f4-ac60-dc04ecbccd95'),
('2fa53754-fa96-5cc0-8e3e-84c9826efcd2','eb5c6957-b178-55c8-95cc-4f48c8293a52','0c20051b-9938-5e15-b678-8e6e1b8e8281'),
('357dcdfe-5ebf-5384-92c3-8ce8daae4ede','f640c937-8475-57bf-85db-b9e0b1cdd5a8','45138c72-1e3e-5585-b190-e4b313596880'),
('ec493ce4-1e5a-5023-ada7-bec9945af950','f2854951-d000-5606-b263-1a4678b44a1b','bbbf308e-8e7c-5f78-8550-9e984f05d95f'),
('1d175da9-ceb2-5df5-a6e7-62623244f97f','5e1abd91-9ef2-5731-9c96-d84551112305','a4631555-8b43-5457-819d-67c5f973262f'),
('f1f14f63-d128-502f-9746-600b4f701213','fad4bb0c-e890-5b74-a50e-6c1e32ef1ffd','67cb03f3-d6f1-52e0-9857-0485df811bc8'),
('4f17e826-d0d9-5596-8933-84189b8b6a1f','00be4f16-d2ae-5cd0-87ca-195823569820','4fffde97-1d2a-51c5-b6b2-01b05a08593d'),
('73b20502-20de-585e-a6cd-1c5a3263cced','a0db83b8-b718-5dbe-aab1-db305836732e','36461b43-74f2-5461-a79d-26b13ff90ce9'),
('85ba7676-5a32-538b-9a37-352c99e19c22','fc3db0fa-4eb3-5efc-89ab-66095903bd0a','a47a4068-c383-5ad7-b4e6-df2e86b2dcf7'),
('eb382a34-d31b-5dca-b745-62169d7c20e7','b3d7aff0-090d-576d-826a-e7b3ba2af90c','0d238230-992a-5664-a3ae-1a1382dfafd3'),
('0f85d20f-00f6-592c-83fa-2a4551e8655e','652d628e-625c-56e8-bfa6-2e99d6fe7080','f30dcca6-7f74-5328-93ec-c55ecadc3a02'),
('89283a1f-010a-5aab-8199-adc362696a53','2ebe991d-6d70-528c-96e6-b00318cbae21','b8e73e88-7172-5721-b79f-49f99cb28229'),
('a45a8199-2b92-51a0-9dd7-edbf2bb93e36','87d1c2b6-ba6e-5516-9cdc-6fbb5c1446ac','c6526c7b-f02c-50ac-8160-ba086958bce6'),
('0492d07e-fd00-51f9-9691-bd2af36dd6fc','2660e1a8-7f4c-54fa-88c0-202928eacac9','d1be8870-647e-52f7-9fe1-f7ece5382c3b'),
('cc32e690-2a88-51e4-8072-a03234d60841','2660e1a8-7f4c-54fa-88c0-202928eacac9','0f1adb19-82c9-5d22-9996-8576da796525'),
('ee96f4f2-c46a-5f2b-8b79-983c5dd92090','caaab5c4-8e5e-534c-93ca-51c1eff165f5','45138c72-1e3e-5585-b190-e4b313596880');

INSERT INTO instructor (id,label,active) VALUES
('10000000-0000-0000-0000-000000000001','Intervenant exemple A',true),
('10000000-0000-0000-0000-000000000002','Intervenant exemple B',true);

INSERT INTO training_session (id,title,state,capacity,formation_id) VALUES
('20000000-0000-0000-0000-000000000001','Exemple — Accueil','PLANIFIEE',12,'eb5c6957-b178-55c8-95cc-4f48c8293a52'),
('20000000-0000-0000-0000-000000000002','Exemple — Prévention','PLANIFIEE',8,'87d1c2b6-ba6e-5516-9cdc-6fbb5c1446ac'),
('20000000-0000-0000-0000-000000000003','Exemple — Session clôturée','TERMINEE',10,'caaab5c4-8e5e-534c-93ca-51c1eff165f5'),
('20000000-0000-0000-0000-000000000004','Exemple — Session à venir','PLANIFIEE',NULL,'f640c937-8475-57bf-85db-b9e0b1cdd5a8');

INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES ('21000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',current_date + interval '7 days' + interval '9 hours',current_date + interval '7 days' + interval '12 hours');
INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES ('21000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',current_date + interval '14 days' + interval '9 hours',current_date + interval '14 days' + interval '12 hours');
INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES ('21000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003',current_date + interval '-30 days' + interval '9 hours',current_date + interval '-30 days' + interval '12 hours');
INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES ('21000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004',current_date + interval '30 days' + interval '9 hours',current_date + interval '30 days' + interval '12 hours');

INSERT INTO session_instructor (session_id,instructor_id) VALUES
('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002'),
('20000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000001'),
('20000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001');

INSERT INTO collaborator (id,professional_id,first_name,last_name,active) VALUES
('30000000-0000-0000-0000-000000000001','EXEMPLE-001','Camille','Exemple',true),
('2864b3e6-f0d7-57ba-a75d-650073218d45','EXEMPLE-002','Nour','Démo',true),
('14638cb8-fd20-594c-a0a0-2638efda6e14','EXEMPLE-003','Alex','Fictif',false);

INSERT INTO participation (id,session_id,collaborator_id,state) VALUES
('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','INSCRITE'),
('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','DESISTEE'),
('40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000001','PRESENTE'),
('40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000001','INSCRITE'),
('d5dbff13-0dac-552e-8970-518fe3a95595','20000000-0000-0000-0000-000000000001','2864b3e6-f0d7-57ba-a75d-650073218d45','INSCRITE'),
('c833fd93-ab5f-5bae-8912-e45fe61c5589','20000000-0000-0000-0000-000000000003','2864b3e6-f0d7-57ba-a75d-650073218d45','ABSENTE'),
('2561828c-bf98-580c-acf7-9463699f1d0e','20000000-0000-0000-0000-000000000003','14638cb8-fd20-594c-a0a0-2638efda6e14','PRESENTE');

-- Les cinq comptes fictifs sont recréés par DevelopmentAccounts au redémarrage.
COMMIT;
