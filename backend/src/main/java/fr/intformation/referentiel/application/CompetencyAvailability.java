package fr.intformation.referentiel.application;

import java.util.UUID;

/** Boundary for association writers: check and lock in the caller's transaction. */
public interface CompetencyAvailability {
    void requireActive(UUID id);
}
