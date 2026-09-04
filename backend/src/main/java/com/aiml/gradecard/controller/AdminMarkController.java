package com.aiml.gradecard.controller;

import com.aiml.gradecard.dto.AdminMarkRequest;
import com.aiml.gradecard.dto.MarkRowDto;
import com.aiml.gradecard.entity.MarkRecord;
import com.aiml.gradecard.repository.MarkRecordRepository;
import com.aiml.gradecard.service.AdminMarkService;
import com.aiml.gradecard.service.ApiException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Add / Show / Update / Delete / Search Marksheet , the CRUD surface the
 * CNT lab experiment (Postman-testable REST + JPA) asks for. Not linked from
 * the main student-facing nav; reachable at /admin in the frontend. */
@RestController
@RequestMapping("/api/admin/marks")
@RequiredArgsConstructor
public class AdminMarkController {

    private final MarkRecordRepository markRecordRepository;
    private final AdminMarkService adminMarkService;

    /** Show all (optionally filtered) , also serves as Search. */
    @GetMapping
    public List<MarkRowDto> search(@RequestParam(required = false) String prn,
                                    @RequestParam(required = false) String subjectCode,
                                    @RequestParam(required = false) String year,
                                    @RequestParam(required = false) Integer semester) {
        List<MarkRecord> all = markRecordRepository.findAll();
        return all.stream()
                .filter(m -> prn == null || m.getStudent().getPrn().equalsIgnoreCase(prn))
                .filter(m -> subjectCode == null || m.getSubject().getCode().equalsIgnoreCase(subjectCode))
                .filter(m -> year == null || m.getSubject().getYear().equalsIgnoreCase(year))
                .filter(m -> semester == null || m.getSubject().getSemester().equals(semester))
                .sorted((a, b) -> a.getStudent().getRollNo().compareTo(b.getStudent().getRollNo()))
                .map(MarkRowDto::from)
                .toList();
    }

    @GetMapping("/{id}")
    public MarkRowDto show(@PathVariable Long id) {
        return markRecordRepository.findById(id)
                .map(MarkRowDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No mark record with id " + id));
    }

    @PostMapping
    public ResponseEntity<MarkRowDto> add(@Valid @RequestBody AdminMarkRequest req) {
        MarkRecord created = adminMarkService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(MarkRowDto.from(created));
    }

    @PutMapping("/{id}")
    public MarkRowDto update(@PathVariable Long id, @Valid @RequestBody AdminMarkRequest req) {
        return MarkRowDto.from(adminMarkService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        adminMarkService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
