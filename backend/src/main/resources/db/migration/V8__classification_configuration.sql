ALTER TABLE requirement_classification ADD COLUMN code varchar(64);
-- Deterministic technical codes preserve existing identities and historical references.
UPDATE requirement_classification SET code='LEGACY-' || id::text;
ALTER TABLE requirement_classification ALTER COLUMN code SET NOT NULL;
-- Compatibility for legacy imports/fixtures which only supply a label.
ALTER TABLE requirement_classification ALTER COLUMN code SET DEFAULT ('LEGACY-' || gen_random_uuid()::text);
ALTER TABLE requirement_classification ADD CONSTRAINT classification_code_not_blank CHECK (length(btrim(code))>0);
CREATE UNIQUE INDEX classification_code_unique ON requirement_classification(lower(code));
ALTER TABLE requirement_classification ADD COLUMN sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order>=0);
ALTER TABLE requirement_classification ADD COLUMN version bigint NOT NULL DEFAULT 0;
