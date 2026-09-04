package com.aiml.gradecard.service;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mirrors scripts/source-data/grading.js exactly. See that file's header
 * comment for how this scale was reverse-engineered from Ragini Pawar's 4
 * real transcripts, and which bands (C+ and below) are an assumption rather
 * than independently verified.
 */
@Component
public class GradingScale {

    public record Band(double min, String grade, int point) {
    }

    private static final List<Band> BANDS = List.of(
            new Band(90, "A+", 10),
            new Band(80, "A", 9),
            new Band(70, "B+", 8),
            new Band(60, "B", 7),
            new Band(55, "C+", 6),
            new Band(50, "C", 5),
            new Band(45, "D", 4),
            new Band(0, "F", 0)
    );

    public Band bandFor(double percent) {
        return BANDS.stream().filter(b -> percent >= b.min()).findFirst().orElse(BANDS.get(BANDS.size() - 1));
    }
}
