package fr.intformation.classifications.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.*;

interface ClassificationRepository extends JpaRepository<ClassificationEntity,UUID> {
    org.springframework.data.domain.Page<ClassificationEntity> findByActiveTrue(org.springframework.data.domain.Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from ClassificationEntity d where d.id=:id")
    Optional<ClassificationEntity> findLocked(UUID id);
}
