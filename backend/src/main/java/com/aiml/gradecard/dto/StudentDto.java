package com.aiml.gradecard.dto;

import com.aiml.gradecard.entity.Student;

public record StudentDto(String prn, Integer rollNo, String name, String division) {
    public static StudentDto from(Student s) {
        return new StudentDto(s.getPrn(), s.getRollNo(), s.getName(), s.getDivision());
    }
}
