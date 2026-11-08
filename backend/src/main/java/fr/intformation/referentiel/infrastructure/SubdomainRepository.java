package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.*;

interface SubdomainRepository extends JpaRepository<SubdomainEntity,UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from SubdomainEntity s where s.id=:id")
    Optional<SubdomainEntity> findLocked(UUID id);
}
