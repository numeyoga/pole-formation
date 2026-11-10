CREATE TABLE formation_competency (
    id uuid PRIMARY KEY,
    formation_id uuid NOT NULL REFERENCES formation(id),
    competency_id uuid NOT NULL REFERENCES competency_reference(id),
    CONSTRAINT formation_competency_pair_unique UNIQUE (formation_id, competency_id)
);
CREATE INDEX formation_competency_competency ON formation_competency(competency_id);
