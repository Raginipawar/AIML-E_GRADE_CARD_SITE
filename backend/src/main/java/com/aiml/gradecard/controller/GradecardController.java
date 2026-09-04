package com.aiml.gradecard.controller;

import com.aiml.gradecard.dto.SemesterGradecardDto;
import com.aiml.gradecard.entity.Student;
import com.aiml.gradecard.service.GradecardService;
import com.aiml.gradecard.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Backs the "Gradecard & CGPA Finder" tab , fetches one semester's official-
 * style grade card at a time, exactly like the real VIT student portal
 * (Academic Year + Semester -> Fetch). */
@RestController
@RequestMapping("/api/gradecard")
@RequiredArgsConstructor
public class GradecardController {

    private final GradecardService gradecardService;
    private final PdfService pdfService;

    @GetMapping
    public SemesterGradecardDto get(@RequestParam String prn, @RequestParam String name,
                                     @RequestParam String year, @RequestParam Integer semester) {
        Student student = gradecardService.validateAndFetchStudent(prn, name);
        return gradecardService.buildSemesterGradecard(student, year.toUpperCase(), semester);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> pdf(@RequestParam String prn, @RequestParam String name,
                                       @RequestParam String year, @RequestParam Integer semester) {
        Student student = gradecardService.validateAndFetchStudent(prn, name);
        SemesterGradecardDto gc = gradecardService.buildSemesterGradecard(student, year.toUpperCase(), semester);
        byte[] pdf = pdfService.gradecardPdf(gc);

        String filename = "Gradecard_" + student.getPrn() + "_" + year.toUpperCase() + s(semester) + ".pdf";
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(pdf);
    }

    private String s(Integer semester) {
        return "_Sem" + semester;
    }
}
