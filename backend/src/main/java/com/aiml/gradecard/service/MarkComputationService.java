package com.aiml.gradecard.service;

import com.aiml.gradecard.entity.Subject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;

/** Turns raw component scores into {totalPercent, letterGrade, gradePoint},
 * validated against the subject's exam-weight scheme. Used by both the seed
 * loader's downstream admin edits and the /api/admin/marks CRUD endpoints,
 * so a manually-added or edited mark is graded with the exact same rule the
 * generator used. */
@Service
@RequiredArgsConstructor
public class MarkComputationService {

    private final GradingScale gradingScale;

    public record Computed(double totalPercent, String letterGrade, Integer gradePoint) {
    }

    public Computed compute(Subject subject, Map<String, Double> components) {
        if (subject.getCredits() == 0) {
            return new Computed(0, "P", null);
        }
        if (subject.getScheme() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Subject " + subject.getCode() + " has no exam scheme configured");
        }
        double total = 0;
        for (Map<String, Object> comp : subject.getScheme()) {
            String key = (String) comp.get("key");
            Number weight = (Number) comp.get("weight");
            Double score = components.get(key);
            if (score == null) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Missing component '" + key + "' for " + subject.getCode());
            }
            if (score < 0 || score > weight.doubleValue()) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Component '" + key + "' must be between 0 and " + weight + " for " + subject.getCode());
            }
            total += score;
        }
        total = Math.round(total * 10) / 10.0;
        GradingScale.Band band = gradingScale.bandFor(total);
        return new Computed(total, band.grade(), band.point());
    }
}
