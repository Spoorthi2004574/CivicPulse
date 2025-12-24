package com.project.auth.repository;

import com.project.auth.entity.Role;
import com.project.auth.entity.Status;
import com.project.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRoleAndStatus(Role role, Status status);
}





