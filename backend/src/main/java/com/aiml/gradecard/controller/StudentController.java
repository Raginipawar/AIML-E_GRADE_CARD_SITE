package com.aiml.gradecard.controller;

import com.aiml.gradecard.dto.StudentDto;
import com.aiml.gradecard.repository.StudentRepository;
import com.aiml.gradecard.service.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping
    public List<StudentDto> list() {
        return studentRepository.findAll().stream()
                .sorted((a, b) -> a.getRollNo().compareTo(b.getRollNo()))
                .map(StudentDto::from)
                .toList();
    }

    @GetMapping("/{prn}")
    public StudentDto get(@PathVariable String prn) {
        return studentRepository.findByPrn(prn)
                .map(StudentDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No student found with PRN " + prn));
    }
}
