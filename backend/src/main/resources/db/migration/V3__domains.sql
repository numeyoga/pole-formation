ALTER TABLE domain_reference ADD COLUMN code varchar(64) NOT NULL DEFAULT ('MIG-' || gen_random_uuid()::text);
ALTER TABLE domain_reference ADD COLUMN active boolean NOT NULL DEFAULT true;
ALTER TABLE domain_reference ADD COLUMN version bigint NOT NULL DEFAULT 0;
ALTER TABLE domain_reference ADD CONSTRAINT domain_code_not_blank CHECK (length(btrim(code)) > 0);
CREATE UNIQUE INDEX domain_reference_code_unique ON domain_reference(lower(code));
CREATE TABLE subdomain_reference (
  id uuid PRIMARY KEY,
  domain_id uuid NOT NULL REFERENCES domain_reference(id),
  label varchar(200) NOT NULL CHECK (length(btrim(label)) > 0)
);
CREATE INDEX subdomain_reference_parent ON subdomain_reference(domain_id);
