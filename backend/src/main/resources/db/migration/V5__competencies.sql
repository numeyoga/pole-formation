ALTER TABLE competency_reference ADD COLUMN code varchar(64) NOT NULL DEFAULT ('MIG-' || gen_random_uuid()::text);
ALTER TABLE competency_reference ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE competency_reference ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE competency_reference ADD CONSTRAINT competency_code_not_blank CHECK (length(btrim(code)) > 0);
CREATE UNIQUE INDEX competency_reference_code_unique ON competency_reference(lower(code));
