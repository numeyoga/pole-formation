package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="competency_reference")
class CompetencyEntity {
    @Id UUID id;
    @Column(name="subdomain_id",nullable=false,updatable=false) UUID subdomainId;
    @Column(nullable=false,length=64) String code;
    @Column(nullable=false,length=200) String label;
    @Column(nullable=false) boolean active;
    @Version long version;
    protected CompetencyEntity(){}
}
