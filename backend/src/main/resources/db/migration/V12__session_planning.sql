ALTER TABLE training_session ADD COLUMN modalities varchar(4000) NOT NULL DEFAULT '';
ALTER TABLE training_session ADD COLUMN version bigint NOT NULL DEFAULT 0 CHECK (version >= 0);
