package fr.intformation.habilitations.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

interface AccountRepository extends JpaRepository<AccountEntity,String> {}
