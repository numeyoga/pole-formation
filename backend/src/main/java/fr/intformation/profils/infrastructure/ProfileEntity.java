package fr.intformation.profils.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="job_profile")
class ProfileEntity {
    @Id UUID id;
    @Column(nullable=false,length=64) String code;
    @Column(nullable=false,length=200) String label;
    @Column(nullable=false,length=4000) String description;
    @Column(nullable=false) boolean active;
    @Version long version;
    protected ProfileEntity(){}
}
