package com.aiml.gradecard.entity;

import com.aiml.gradecard.util.JsonConverters;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Entity
@Table(name = "mark_records", uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "subject_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarkRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    /** component key -> score earned, e.g. {"test1": 29.0, "test2": 30.0, "cvv": 27.9} */
    @Convert(converter = JsonConverters.ComponentScoresConverter.class)
    @Column(name = "components_json", length = 2000)
    private Map<String, Double> components;

    /** null for 0-credit Pass-only subjects */
    @Column(name = "total_percent")
    private Double totalPercent;

    @Column(name = "letter_grade", nullable = false, length = 3)
    private String letterGrade;

    /** null for 0-credit Pass-only subjects (excluded from GPA) */
    @Column(name = "grade_point")
    private Integer gradePoint;
}
