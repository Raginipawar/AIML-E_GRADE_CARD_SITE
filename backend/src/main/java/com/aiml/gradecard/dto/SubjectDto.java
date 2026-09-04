package com.aiml.gradecard.dto;

import com.aiml.gradecard.entity.Subject;

import java.util.List;
import java.util.Map;

public record SubjectDto(Long id, String code, String title, Integer credits, String year,
                          Integer semester, boolean hasResults, List<Map<String, Object>> scheme) {
    public static SubjectDto from(Subject s) {
        return new SubjectDto(s.getId(), s.getCode(), s.getTitle(), s.getCredits(), s.getYear(),
                s.getSemester(), s.isHasResults(), s.getScheme());
    }
}
