package fr.intformation.habilitations.infrastructure;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="app_account")
class AccountEntity {
    @Id String username;
    @Column(name="password_hash",nullable=false) String passwordHash;
    @Column(nullable=false) String role;
    @Column(name="instructor_id") UUID instructorId;
    protected AccountEntity() {}
}
