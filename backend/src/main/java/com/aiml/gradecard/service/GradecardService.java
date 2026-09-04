package com.aiml.gradecard.service;

import com.aiml.gradecard.dto.*;
import com.aiml.gradecard.entity.MarkRecord;
import com.aiml.gradecard.entity.Student;
import com.aiml.gradecard.entity.Subject;
import com.aiml.gradecard.repository.MarkRecordRepository;
import com.aiml.gradecard.repository.StudentRepository;
import com.aiml.gradecard.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GradecardService {

    private static final List<String> YEAR_ORDER = List.of("FY", "SY", "TY");

    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final MarkRecordRepository markRecordRepository;

    /** Case/whitespace-insensitive, order-insensitive "does the typed name
     * plausibly refer to this student" check , e.g. "Ragini Pawar" matches
     * the stored official "Pawar Ragini Vinod". Guards the gradecard lookup
     * without requiring classmates to know the exact official name order. */
    public Student validateAndFetchStudent(String prn, String name) {
        Student student = studentRepository.findByPrn(prn.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No student found with PRN " + prn + " in CSAIML-E"));

        Set<String> storedWords = new HashSet<>(Arrays.asList(student.getName().toUpperCase().split("\\s+")));
        String[] typedWords = name.trim().toUpperCase().split("\\s+");
        if (typedWords.length == 0 || (typedWords.length == 1 && typedWords[0].isBlank())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        long matched = Arrays.stream(typedWords).filter(storedWords::contains).count();
        if (matched < Math.min(2, typedWords.length)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "PRN and Name do not match our records");
        }
        return student;
    }

    /** One semester's official-style grade card: that semester's course
     * table plus both the Current Semester Record and Cumulative Semester
     * Record (as of and including this semester) , mirrors a real VIT
     * provisional marksheet exactly. */
    public SemesterGradecardDto buildSemesterGradecard(Student student, String year, Integer semester) {
        if (!YEAR_ORDER.contains(year) || (semester != 1 && semester != 2)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Year must be one of FY, SY, TY and semester must be 1 or 2");
        }
        int targetYearIdx = YEAR_ORDER.indexOf(year);

        int cumCreditsRegistered = 0;
        int cumCreditsEarned = 0;
        double cumPoints = 0;
        int cumGpaCredits = 0;

        List<SubjectResultDto> currentSubjects = null;
        int currentCredRegistered = 0;
        int currentCredEarned = 0;
        Double sgpa = null;
        boolean targetHasResults = false;
        boolean anyFail = false;

        outer:
        for (int yi = 0; yi <= targetYearIdx; yi++) {
            String y = YEAR_ORDER.get(yi);
            for (int s = 1; s <= 2; s++) {
                boolean isTarget = y.equals(year) && s == semester;
                List<Subject> subjects = subjectRepository.findByYearAndSemesterOrderByCodeAsc(y, s);
                if (subjects.isEmpty()) {
                    if (isTarget) throw new ApiException(HttpStatus.NOT_FOUND, "No subjects found for " + y + " semester " + s);
                    continue;
                }
                boolean subjHasResults = subjects.get(0).isHasResults();

                if (isTarget) {
                    targetHasResults = subjHasResults;
                    List<SubjectResultDto> dtos = new ArrayList<>();
                    int cr = 0, ce = 0;
                    double sp = 0;
                    int sgc = 0;
                    for (Subject subject : subjects) {
                        cr += subject.getCredits();
                        if (!subjHasResults) {
                            dtos.add(new SubjectResultDto(subject.getCode(), subject.getTitle(), subject.getCredits(), null, null, null, null));
                            continue;
                        }
                        MarkRecord mark = markRecordRepository.findByStudentAndSubject(student, subject)
                                .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                                        "Missing mark record for " + student.getPrn() + " / " + subject.getCode()));
                        dtos.add(new SubjectResultDto(subject.getCode(), subject.getTitle(), subject.getCredits(),
                                mark.getComponents(), mark.getTotalPercent(), mark.getLetterGrade(), mark.getGradePoint()));
                        if ("F".equals(mark.getLetterGrade())) anyFail = true;
                        else ce += subject.getCredits();
                        if (mark.getGradePoint() != null) {
                            sp += subject.getCredits() * mark.getGradePoint();
                            sgc += subject.getCredits();
                        }
                    }
                    currentSubjects = dtos;
                    currentCredRegistered = cr;
                    currentCredEarned = ce;
                    sgpa = subjHasResults && sgc > 0 ? Math.round((sp / sgc) * 100) / 100.0 : null;
                    if (subjHasResults) {
                        cumCreditsRegistered += cr;
                        cumCreditsEarned += ce;
                        cumPoints += sp;
                        cumGpaCredits += sgc;
                    }
                    break outer;
                }

                if (!subjHasResults) continue;
                int cr = 0, ce = 0;
                double sp = 0;
                int sgc = 0;
                for (Subject subject : subjects) {
                    cr += subject.getCredits();
                    MarkRecord mark = markRecordRepository.findByStudentAndSubject(student, subject)
                            .orElseThrow(() -> new ApiException(HttpStatus.INTERNAL_SERVER_ERROR,
                                    "Missing mark record for " + student.getPrn() + " / " + subject.getCode()));
                    if (!"F".equals(mark.getLetterGrade())) ce += subject.getCredits();
                    if (mark.getGradePoint() != null) {
                        sp += subject.getCredits() * mark.getGradePoint();
                        sgc += subject.getCredits();
                    }
                }
                cumCreditsRegistered += cr;
                cumCreditsEarned += ce;
                cumPoints += sp;
                cumGpaCredits += sgc;
            }
        }

        Double cgpa = cumGpaCredits > 0 ? Math.round((cumPoints / cumGpaCredits) * 100) / 100.0 : null;
        String resultStatus = !targetHasResults ? "Not Yet Declared" : (anyFail ? "FAIL" : "PASS");

        return new SemesterGradecardDto(StudentDto.from(student), year, semester, targetHasResults, currentSubjects,
                currentCredRegistered, currentCredEarned, sgpa, cumCreditsRegistered, cumCreditsEarned, cgpa, resultStatus);
    }
}
