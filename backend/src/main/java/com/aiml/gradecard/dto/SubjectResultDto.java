package com.aiml.gradecard.dto;

import java.util.Map;

public record SubjectResultDto(String code, String title, Integer credits,
                                Map<String, Double> components, Double totalPercent,
                                String letterGrade, Integer gradePoint) {
}
