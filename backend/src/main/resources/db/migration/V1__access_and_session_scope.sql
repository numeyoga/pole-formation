CREATE TABLE instructor (id uuid PRIMARY KEY, label text NOT NULL);
CREATE TABLE app_account (
  username varchar(100) PRIMARY KEY,
  password_hash text NOT NULL,
  role varchar(40) NOT NULL CHECK (role IN ('INTERVENANT','GESTIONNAIRE','ADMINISTRATEUR_FONCTIONNEL')),
  instructor_id uuid REFERENCES instructor(id)
);
CREATE TABLE training_session (
  id uuid PRIMARY KEY,
  title varchar(200) NOT NULL,
  state varchar(20) NOT NULL CHECK (state IN ('BROUILLON','PLANIFIEE','TERMINEE','ANNULEE'))
);
CREATE TABLE session_slot (
  id uuid PRIMARY KEY, session_id uuid NOT NULL REFERENCES training_session(id),
  starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL,
  CHECK (ends_at > starts_at)
);
CREATE TABLE session_instructor (
  session_id uuid NOT NULL REFERENCES training_session(id),
  instructor_id uuid NOT NULL REFERENCES instructor(id),
  PRIMARY KEY (session_id, instructor_id)
);
CREATE TABLE collaborator (
  id uuid PRIMARY KEY, professional_id varchar(100) NOT NULL UNIQUE,
  first_name varchar(100) NOT NULL, last_name varchar(100) NOT NULL
);
CREATE TABLE participation (
  id uuid PRIMARY KEY, session_id uuid NOT NULL REFERENCES training_session(id),
  collaborator_id uuid NOT NULL REFERENCES collaborator(id),
  state varchar(20) NOT NULL CHECK (state IN ('INSCRITE','PRESENTE','ABSENTE','DESISTEE')),
  UNIQUE(session_id, collaborator_id)
);
CREATE TABLE domain_reference (id uuid PRIMARY KEY, label varchar(200) NOT NULL);
CREATE TABLE requirement_classification (id uuid PRIMARY KEY, label varchar(200) NOT NULL);
CREATE TABLE access_audit (
  id uuid PRIMARY KEY, occurred_at timestamptz NOT NULL,
  actor varchar(100) NOT NULL, action varchar(60) NOT NULL,
  target varchar(100) NOT NULL, before_value text NOT NULL, after_value text NOT NULL
);
