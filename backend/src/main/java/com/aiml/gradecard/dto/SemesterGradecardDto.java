package com.aiml.gradecard.dto;

import java.util.List;

/** A single semester's official-style grade card: the course table for that
 * semester plus both the "Current Semester Record" and "Cumulative Semester
 * Record" summary rows, exactly like a real VIT provisional marksheet. */
public record SemesterGradecardDto(
        StudentDto student,
        String year,
        Integer semester,
        boolean hasResults,
        List<SubjectResultDto> subjects,
        int currentCreditsRegistered,
        int currentCreditsEarned,
        Double sgpa,
        int cumulativeCreditsRegistered,
        int cumulativeCreditsEarned,
        Double cgpa,
        String resultStatus
) {
}
