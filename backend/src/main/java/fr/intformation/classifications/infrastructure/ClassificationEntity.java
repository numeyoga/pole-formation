package fr.intformation.classifications.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="requirement_classification")
class ClassificationEntity {
    @Id UUID id;
    @Column(nullable=false,length=64) String code;
    @Column(nullable=false,length=200) String label;
    @Column(name="sort_order",nullable=false) int sortOrder;
    @Column(nullable=false) boolean active;
    @Version long version;
    protected ClassificationEntity(){}
}
