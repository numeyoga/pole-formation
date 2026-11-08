package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.*;

interface CompetencyRepository extends JpaRepository<CompetencyEntity,UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from CompetencyEntity s where s.id=:id")
    Optional<CompetencyEntity> findLocked(UUID id);
}
