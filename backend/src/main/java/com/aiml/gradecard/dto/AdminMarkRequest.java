package com.aiml.gradecard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/** Body for the /api/admin/marks Add/Update endpoints. Component scores are
 * raw marks per the target subject's scheme; the server recomputes
 * totalPercent/letterGrade/gradePoint from them rather than trusting the caller. */
public record AdminMarkRequest(
        @NotBlank String prn,
        @NotBlank String subjectCode,
        @NotBlank String year,
        @NotNull Integer semester,
        @NotEmpty Map<String, Double> components
) {
}
