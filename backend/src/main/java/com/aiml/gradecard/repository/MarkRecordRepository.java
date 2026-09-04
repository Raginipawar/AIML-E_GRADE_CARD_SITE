package com.aiml.gradecard.repository;

import com.aiml.gradecard.entity.MarkRecord;
import com.aiml.gradecard.entity.Student;
import com.aiml.gradecard.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarkRecordRepository extends JpaRepository<MarkRecord, Long> {
    List<MarkRecord> findBySubject(Subject subject);
    List<MarkRecord> findBySubjectId(Long subjectId);
    List<MarkRecord> findByStudent(Student student);
    List<MarkRecord> findByStudentAndSubject_Year(Student student, String year);
    Optional<MarkRecord> findByStudentAndSubject(Student student, Subject subject);
    Optional<MarkRecord> findByStudent_PrnAndSubject_Id(String prn, Long subjectId);
}
