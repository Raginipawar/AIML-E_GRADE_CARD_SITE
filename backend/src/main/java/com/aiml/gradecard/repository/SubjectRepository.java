package com.aiml.gradecard.repository;

import com.aiml.gradecard.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByYearOrderBySemesterAscCodeAsc(String year);
    List<Subject> findByYearAndSemesterOrderByCodeAsc(String year, Integer semester);
    Optional<Subject> findByCodeAndYearAndSemester(String code, String year, Integer semester);
    List<Subject> findAllByOrderByYearAscSemesterAscCodeAsc();
}
