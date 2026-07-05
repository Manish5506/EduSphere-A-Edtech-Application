package com.edtech.controller;

import com.edtech.entity.Certificate;
import com.edtech.entity.Enrollment;
import com.edtech.security.UserPrincipal;
import com.edtech.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    // --- STUDENT ENROLLMENT & PROGRESS ---

    @GetMapping("/enrollments/my-courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Enrollment>> getStudentEnrollments(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(enrollmentService.getStudentEnrollments(userPrincipal.getId()));
    }

    @GetMapping("/enrollments/course/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Enrollment> getEnrollmentDetails(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentDetails(userPrincipal.getId(), courseId));
    }

    @PutMapping("/enrollments/course/{courseId}/lessons/{lessonId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Enrollment> updateLessonProgress(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable Long courseId,
            @PathVariable Long lessonId,
            @RequestParam boolean completed) {
        Enrollment updated = enrollmentService.updateLessonProgress(
                userPrincipal.getId(), courseId, lessonId, completed);
        return ResponseEntity.ok(updated);
    }

    // --- CERTIFICATES ---

    @GetMapping("/certificates/my-certificates")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<Certificate>> getMyCertificates(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(enrollmentService.getStudentCertificates(userPrincipal.getId()));
    }

    @GetMapping("/certificates/verify/{uuid}")
    public ResponseEntity<Certificate> verifyCertificate(@PathVariable String uuid) {
        return ResponseEntity.ok(enrollmentService.getCertificateByUuid(uuid));
    }
}
