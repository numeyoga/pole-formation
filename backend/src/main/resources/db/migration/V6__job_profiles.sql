CREATE TABLE job_profile (
    id uuid PRIMARY KEY,
    code varchar(64) NOT NULL CHECK (length(btrim(code)) > 0),
    label varchar(200) NOT NULL CHECK (length(btrim(label)) > 0),
    description varchar(4000) NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT true,
    version bigint NOT NULL DEFAULT 0
);
ALTER TABLE requirement_classification ADD COLUMN active boolean NOT NULL DEFAULT true;
CREATE TABLE profile_requirement (
    id uuid PRIMARY KEY,
    profile_id uuid NOT NULL REFERENCES job_profile(id),
    competency_id uuid NOT NULL REFERENCES competency_reference(id),
    classification_id uuid NOT NULL REFERENCES requirement_classification(id),
    CONSTRAINT profile_requirement_pair_unique UNIQUE(profile_id,competency_id)
);
