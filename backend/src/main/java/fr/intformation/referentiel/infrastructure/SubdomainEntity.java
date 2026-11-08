package fr.intformation.referentiel.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="subdomain_reference")
class SubdomainEntity {
    @Id UUID id;
    @Column(name="domain_id",nullable=false,updatable=false) UUID domainId;
    @Column(nullable=false,length=64) String code;
    @Column(nullable=false,length=200) String label;
    @Column(nullable=false) boolean active;
    @Version long version;
    protected SubdomainEntity(){}
}
