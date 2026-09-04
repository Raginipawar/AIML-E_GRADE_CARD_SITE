package com.aiml.gradecard.service;

import java.util.List;
import java.util.Map;

/** Shape of backend/src/main/resources/data/seed.json, produced by
 * scripts/generate-seed-data.js. Kept as plain records purely for Jackson
 * deserialization at boot time. */
public class SeedData {

    public record StudentRow(Integer rollNo, String prn, String name, String division) {
    }

    public record SubjectRow(String code, String title, Integer credits, String year, Integer semester,
                              boolean hasResults, List<Map<String, Object>> scheme) {
    }

    public record MarkRow(String prn, String subjectCode, String year, Integer semester,
                           Map<String, Double> components, Double totalPercent, String letterGrade,
                           Integer gradePoint) {
    }

    public String generatedAt;
    public String division;
    public List<StudentRow> students;
    public List<SubjectRow> subjects;
    public List<MarkRow> markRecords;
}
