package com.aiml.gradecard.repository;

import com.aiml.gradecard.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByPrn(String prn);
}
