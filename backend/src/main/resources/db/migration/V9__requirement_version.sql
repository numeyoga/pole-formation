ALTER TABLE profile_requirement ADD COLUMN version bigint NOT NULL DEFAULT 0 CHECK (version >= 0);
