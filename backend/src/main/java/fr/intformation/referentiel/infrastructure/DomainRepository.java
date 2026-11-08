package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.*;

interface DomainRepository extends JpaRepository<DomainEntity,UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from DomainEntity d where d.id=:id")
    Optional<DomainEntity> findLocked(UUID id);
}
