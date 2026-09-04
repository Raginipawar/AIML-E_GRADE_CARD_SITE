package com.aiml.gradecard.entity;

import com.aiml.gradecard.util.JsonConverters;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "subjects", uniqueConstraints = @UniqueConstraint(columnNames = {"code", "year", "semester"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String code;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false)
    private Integer credits;

    /** FY, SY or TY */
    @Column(nullable = false, length = 5)
    private String year;

    @Column(nullable = false)
    private Integer semester;

    /** true once results for this year+semester have been officially declared */
    @Column(name = "has_results", nullable = false)
    private boolean hasResults;

    /** Real official (or documented generic fallback) exam-weight breakdown, e.g.
     * [{"key":"test1","label":"Test 1","weight":35,"written":true}, ...] */
    @Convert(converter = JsonConverters.SchemeConverter.class)
    @Column(name = "scheme_json", length = 4000)
    private List<Map<String, Object>> scheme;
}
