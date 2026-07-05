package com.edtech.controller;

import com.edtech.dto.CategoryDTO;
import com.edtech.dto.CourseDTO;
import com.edtech.dto.LessonDTO;
import com.edtech.dto.SectionDTO;
import com.edtech.security.UserPrincipal;
import com.edtech.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CourseController {

    @Autowired
    private CourseService courseService;

    // --- CATEGORIES ---

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(courseService.getAllCategories());
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody CategoryDTO dto) {
        return ResponseEntity.ok(courseService.createCategory(dto));
    }

    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long categoryId) {
        courseService.deleteCategory(categoryId);
        return ResponseEntity.ok("Category deleted successfully");
    }

    // --- PUBLIC COURSE BROWSING ---

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDTO>> getApprovedCourses() {
        return ResponseEntity.ok(courseService.getApprovedCourses());
    }

    @GetMapping("/courses/category/{categoryId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(courseService.getCoursesByCategory(categoryId));
    }

    @GetMapping("/courses/search")
    public ResponseEntity<List<CourseDTO>> searchCourses(@RequestParam String query) {
        return ResponseEntity.ok(courseService.searchCourses(query));
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    // --- INSTRUCTOR COURSE MANAGEMENT ---

    @GetMapping("/courses/my-courses")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<List<CourseDTO>> getInstructorCourses(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(courseService.getInstructorCourses(userPrincipal.getId()));
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO dto, @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(courseService.createCourse(dto, userPrincipal.getId()));
    }

    @PutMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable Long courseId, @RequestBody CourseDTO dto) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, dto));
    }

    @PutMapping("/courses/{courseId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> publishCourse(@PathVariable Long courseId, @RequestParam boolean published) {
        courseService.publishCourse(courseId, published);
        return ResponseEntity.ok("Course publication status updated to: " + published);
    }

    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.ok("Course deleted successfully");
    }

    // --- ADMIN APPROVALS ---

    @GetMapping("/courses/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CourseDTO>> getPendingCourses() {
        return ResponseEntity.ok(courseService.getPendingCourses());
    }

    @PutMapping("/courses/{courseId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveCourse(@PathVariable Long courseId, @RequestParam boolean approved) {
        courseService.approveCourse(courseId, approved);
        return ResponseEntity.ok("Course approval status updated to: " + approved);
    }

    // --- SECTIONS & LESSONS ---

    @PostMapping("/courses/{courseId}/sections")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> addSection(@PathVariable Long courseId, @RequestBody SectionDTO sectionDTO) {
        return ResponseEntity.ok(courseService.addSection(courseId, sectionDTO));
    }

    @PostMapping("/courses/{courseId}/sections/{sectionId}/lessons")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<CourseDTO> addLesson(
            @PathVariable Long courseId,
            @PathVariable Long sectionId,
            @RequestBody LessonDTO lessonDTO) {
        return ResponseEntity.ok(courseService.addLesson(courseId, sectionId, lessonDTO));
    }
}
