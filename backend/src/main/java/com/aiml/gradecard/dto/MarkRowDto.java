package com.aiml.gradecard.dto;

import com.aiml.gradecard.entity.MarkRecord;

import java.util.Map;

public record MarkRowDto(Long markId, StudentDto student, String subjectCode, String subjectTitle,
                          String year, Integer semester, Map<String, Double> components,
                          Double totalPercent, String letterGrade, Integer gradePoint) {
    public static MarkRowDto from(MarkRecord m) {
        return new MarkRowDto(m.getId(), StudentDto.from(m.getStudent()), m.getSubject().getCode(),
                m.getSubject().getTitle(), m.getSubject().getYear(), m.getSubject().getSemester(),
                m.getComponents(), m.getTotalPercent(), m.getLetterGrade(), m.getGradePoint());
    }
}
