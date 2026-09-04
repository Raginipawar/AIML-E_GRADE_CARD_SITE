package com.aiml.gradecard.service;

import com.aiml.gradecard.dto.AdminMarkRequest;
import com.aiml.gradecard.entity.MarkRecord;
import com.aiml.gradecard.entity.Student;
import com.aiml.gradecard.entity.Subject;
import com.aiml.gradecard.repository.MarkRecordRepository;
import com.aiml.gradecard.repository.StudentRepository;
import com.aiml.gradecard.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/** Backend for the /admin CRUD screens (Add / Show / Update / Delete / Search
 * Marksheet) that mirror the CNT lab experiment's sample-output flow. */
@Service
@RequiredArgsConstructor
public class AdminMarkService {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRecordRepository markRecordRepository;
    private final MarkComputationService markComputationService;

    public MarkRecord create(AdminMarkRequest req) {
        Student student = findStudent(req.prn());
        Subject subject = findSubject(req.subjectCode(), req.year(), req.semester());
        markRecordRepository.findByStudentAndSubject(student, subject).ifPresent(m -> {
            throw new ApiException(HttpStatus.CONFLICT, "A mark record already exists for this student and subject, use update instead");
        });
        MarkComputationService.Computed computed = markComputationService.compute(subject, req.components());
        MarkRecord mark = new MarkRecord(null, student, subject, req.components(),
                computed.totalPercent(), computed.letterGrade(), computed.gradePoint());
        return markRecordRepository.save(mark);
    }

    public MarkRecord update(Long id, AdminMarkRequest req) {
        MarkRecord existing = markRecordRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No mark record with id " + id));
        Subject subject = existing.getSubject();
        MarkComputationService.Computed computed = markComputationService.compute(subject, req.components());
        existing.setComponents(req.components());
        existing.setTotalPercent(computed.totalPercent());
        existing.setLetterGrade(computed.letterGrade());
        existing.setGradePoint(computed.gradePoint());
        return markRecordRepository.save(existing);
    }

    public void delete(Long id) {
        if (!markRecordRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No mark record with id " + id);
        }
        markRecordRepository.deleteById(id);
    }

    private Student findStudent(String prn) {
        return studentRepository.findByPrn(prn)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No student found with PRN " + prn));
    }

    private Subject findSubject(String code, String year, Integer semester) {
        return subjectRepository.findByCodeAndYearAndSemester(code, year, semester)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
                        "No such subject: " + code + " (" + year + " sem " + semester + ")"));
    }
}
