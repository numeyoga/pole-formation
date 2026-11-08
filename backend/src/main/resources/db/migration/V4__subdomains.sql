ALTER TABLE subdomain_reference ADD COLUMN code varchar(64) NOT NULL DEFAULT ('MIG-' || gen_random_uuid()::text);
ALTER TABLE subdomain_reference ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE subdomain_reference ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE subdomain_reference ADD CONSTRAINT subdomain_code_not_blank CHECK (length(btrim(code)) > 0);
CREATE UNIQUE INDEX subdomain_reference_code_unique ON subdomain_reference(lower(code));
CREATE TABLE competency_reference (
  id uuid PRIMARY KEY,
  subdomain_id uuid NOT NULL REFERENCES subdomain_reference(id),
  label varchar(200) NOT NULL CHECK (length(btrim(label)) > 0)
);
CREATE INDEX competency_reference_parent ON competency_reference(subdomain_id);
