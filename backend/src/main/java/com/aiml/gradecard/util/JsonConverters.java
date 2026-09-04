package com.aiml.gradecard.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Small JPA converters so we can store the per-subject exam-scheme and
 * per-student component scores as plain JSON text columns, portable between
 * the H2 (local) and MySQL (mysql profile) datasources without needing a
 * native JSON column type on either side.
 *
 * Uses Jackson 3 (package tools.jackson.*) , Spring Boot 4's default JSON
 * engine, distinct from the older com.fasterxml.jackson.databind Jackson 2.
 */
public class JsonConverters {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Converter
    public static class ComponentScoresConverter implements AttributeConverter<Map<String, Double>, String> {
        @Override
        public String convertToDatabaseColumn(Map<String, Double> attribute) {
            if (attribute == null) return null;
            return MAPPER.writeValueAsString(attribute);
        }

        @Override
        public Map<String, Double> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) return new LinkedHashMap<>();
            return MAPPER.readValue(dbData, new TypeReference<LinkedHashMap<String, Double>>() {
            });
        }
    }

    @Converter
    public static class SchemeConverter implements AttributeConverter<List<Map<String, Object>>, String> {
        @Override
        public String convertToDatabaseColumn(List<Map<String, Object>> attribute) {
            if (attribute == null) return null;
            return MAPPER.writeValueAsString(attribute);
        }

        @Override
        public List<Map<String, Object>> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.isBlank()) return null;
            return MAPPER.readValue(dbData, new TypeReference<List<Map<String, Object>>>() {
            });
        }
    }
}
