CREATE TABLE formation (
    id uuid PRIMARY KEY,
    code varchar(64) NOT NULL CHECK (length(btrim(code)) > 0),
    title varchar(200) NOT NULL CHECK (length(btrim(title)) > 0),
    objectives varchar(4000) NOT NULL DEFAULT '',
    description varchar(4000) NOT NULL DEFAULT '',
    duration_minutes integer CHECK (duration_minutes > 0),
    state varchar(20) NOT NULL CHECK (state IN ('BROUILLON','ACTIVE','ARCHIVEE')),
    version bigint NOT NULL DEFAULT 0 CHECK (version >= 0)
);
CREATE UNIQUE INDEX formation_code_unique ON formation(lower(code));
-- Existing sessions retain their identity and history without an invented training link.
-- New sessions created by the application always reference an active formation.
ALTER TABLE training_session ADD COLUMN formation_id uuid REFERENCES formation(id);
CREATE INDEX training_session_formation ON training_session(formation_id);
