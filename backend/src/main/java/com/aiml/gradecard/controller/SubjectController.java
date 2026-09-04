package com.aiml.gradecard.controller;

import com.aiml.gradecard.dto.SubjectDto;
import com.aiml.gradecard.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepository subjectRepository;

    /** All subjects, grouped implicitly by year/semester (frontend groups client-side) , used by the Syllabus & Subjects tab. */
    @GetMapping
    public List<SubjectDto> list(@RequestParam(required = false) String year,
                                  @RequestParam(required = false) Integer semester) {
        List<com.aiml.gradecard.entity.Subject> subjects;
        if (year != null && semester != null) {
            subjects = subjectRepository.findByYearAndSemesterOrderByCodeAsc(year, semester);
        } else if (year != null) {
            subjects = subjectRepository.findByYearOrderBySemesterAscCodeAsc(year);
        } else {
            subjects = subjectRepository.findAllByOrderByYearAscSemesterAscCodeAsc();
        }
        return subjects.stream().map(SubjectDto::from).toList();
    }
}
