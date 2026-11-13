-- Preserve historical labels rather than inventing a split into first and last names.
ALTER TABLE instructor ADD COLUMN first_name varchar(100);
ALTER TABLE instructor ADD COLUMN last_name varchar(100);
ALTER TABLE instructor ADD COLUMN professional_contact varchar(2000) NOT NULL DEFAULT '';
ALTER TABLE instructor ADD COLUMN version bigint NOT NULL DEFAULT 0 CHECK (version >= 0);
ALTER TABLE instructor ADD CONSTRAINT instructor_names_consistent CHECK (
    (first_name IS NULL AND last_name IS NULL) OR
    (first_name IS NOT NULL AND last_name IS NOT NULL AND length(btrim(first_name)) > 0 AND length(btrim(last_name)) > 0)
);
