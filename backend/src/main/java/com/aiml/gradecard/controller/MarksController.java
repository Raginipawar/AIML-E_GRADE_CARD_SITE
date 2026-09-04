package com.aiml.gradecard.controller;

import com.aiml.gradecard.dto.MarkRowDto;
import com.aiml.gradecard.entity.Subject;
import com.aiml.gradecard.repository.MarkRecordRepository;
import com.aiml.gradecard.repository.SubjectRepository;
import com.aiml.gradecard.service.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Backs the "Subject-wise Marks" tab: pick a subject, see every enrolled
 * student's real component breakdown and resulting grade. */
@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarksController {

    private final SubjectRepository subjectRepository;
    private final MarkRecordRepository markRecordRepository;

    @GetMapping
    public List<MarkRowDto> forSubject(@RequestParam String year, @RequestParam Integer semester,
                                        @RequestParam String subjectCode) {
        Subject subject = subjectRepository.findByCodeAndYearAndSemester(subjectCode, year, semester)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No such subject: " + subjectCode + " (" + year + " sem " + semester + ")"));
        if (!subject.isHasResults()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Results not yet declared for " + year + " semester " + semester);
        }
        return markRecordRepository.findBySubject(subject).stream()
                .sorted((a, b) -> a.getStudent().getRollNo().compareTo(b.getStudent().getRollNo()))
                .map(MarkRowDto::from)
                .toList();
    }
}
