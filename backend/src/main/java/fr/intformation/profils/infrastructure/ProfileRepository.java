package fr.intformation.profils.infrastructure;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.util.*;

interface ProfileRepository extends JpaRepository<ProfileEntity,UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from ProfileEntity d where d.id=:id")
    Optional<ProfileEntity> findLocked(UUID id);
}
