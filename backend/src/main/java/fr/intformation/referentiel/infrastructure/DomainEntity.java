package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="domain_reference")
class DomainEntity {
    @Id UUID id;
    @Column(nullable=false,length=64) String code;
    @Column(nullable=false,length=200) String label;
    @Column(nullable=false) boolean active;
    @Version long version;
    protected DomainEntity(){}
}
