package com.aiml.gradecard.service;

import com.aiml.gradecard.entity.MarkRecord;
import com.aiml.gradecard.entity.Student;
import com.aiml.gradecard.entity.Subject;
import com.aiml.gradecard.repository.MarkRecordRepository;
import com.aiml.gradecard.repository.StudentRepository;
import com.aiml.gradecard.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads backend/src/main/resources/data/seed.json into the database on first
 * boot (idempotent , skips entirely if students already exist). See
 * README.md for how that file is generated and what in it is real vs
 * synthetic data.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SeedDataLoader implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRecordRepository markRecordRepository;

    @Override
    public void run(String... args) throws Exception {
        if (studentRepository.count() > 0) {
            log.info("Seed data already present ({} students) , skipping load.", studentRepository.count());
            return;
        }

        ObjectMapper mapper = new ObjectMapper();
        SeedData seed = mapper.readValue(new ClassPathResource("data/seed.json").getInputStream(), SeedData.class);

        Map<String, Student> studentsByPrn = new HashMap<>();
        for (SeedData.StudentRow row : seed.students) {
            Student s = new Student(null, row.prn(), row.rollNo(), row.name(), seed.division);
            studentRepository.save(s);
            studentsByPrn.put(row.prn(), s);
        }

        Map<String, Subject> subjectsByKey = new HashMap<>();
        for (SeedData.SubjectRow row : seed.subjects) {
            Subject subj = new Subject(null, row.code(), row.title(), row.credits(), row.year(),
                    row.semester(), row.hasResults(), row.scheme());
            subjectRepository.save(subj);
            subjectsByKey.put(key(row.code(), row.year(), row.semester()), subj);
        }

        int count = 0;
        for (SeedData.MarkRow row : seed.markRecords) {
            Student student = studentsByPrn.get(row.prn());
            Subject subject = subjectsByKey.get(key(row.subjectCode(), row.year(), row.semester()));
            if (student == null || subject == null) {
                log.warn("Skipping mark row with unresolved student/subject: {} / {}", row.prn(), row.subjectCode());
                continue;
            }
            MarkRecord mark = new MarkRecord(null, student, subject, row.components(), row.totalPercent(),
                    row.letterGrade(), row.gradePoint());
            markRecordRepository.save(mark);
            count++;
        }

        log.info("Loaded {} students, {} subjects, {} mark records from seed.json",
                studentsByPrn.size(), subjectsByKey.size(), count);
    }

    private String key(String code, String year, Integer semester) {
        return code + "|" + year + "|" + semester;
    }
}
