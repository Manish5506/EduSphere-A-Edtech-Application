package com.edtech.service;

import com.edtech.entity.*;
import com.edtech.exception.BadRequestException;
import com.edtech.exception.ResourceNotFoundException;
import com.edtech.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private LessonProgressRepository lessonProgressRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public Enrollment enrollStudent(User student, Course course) {
        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new BadRequestException("Student is already enrolled in this course!");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setProgress(0.0);
        enrollment.setCompleted(false);
        enrollment = enrollmentRepository.save(enrollment);

        // Pre-populate lesson progress
        for (Section section : course.getSections()) {
            for (Lesson lesson : section.getLessons()) {
                LessonProgress progress = new LessonProgress();
                progress.setEnrollment(enrollment);
                progress.setLesson(lesson);
                progress.setCompleted(false);
                lessonProgressRepository.save(progress);
                enrollment.getLessonProgressList().add(progress);
            }
        }

        // Trigger progress calculation in case the course has 0 lessons
        calculateAndSetProgress(enrollment);

        return enrollment;
    }

    public List<Enrollment> getStudentEnrollments(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        return enrollmentRepository.findByStudent(student);
    }

    public Enrollment getEnrollmentDetails(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        return enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "student/course", courseId));
    }

    @Transactional
    public Enrollment updateLessonProgress(Long studentId, Long courseId, Long lessonId, boolean completed) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "student/course", courseId));

        LessonProgress progress = lessonProgressRepository.findByEnrollmentAndLesson(enrollment, lesson)
                .orElseThrow(() -> new ResourceNotFoundException("LessonProgress", "lesson", lessonId));

        progress.setCompleted(completed);
        lessonProgressRepository.save(progress);

        return calculateAndSetProgress(enrollment);
    }

    private Enrollment calculateAndSetProgress(Enrollment enrollment) {
        long totalLessons = enrollment.getCourse().getSections().stream()
                .mapToLong(section -> section.getLessons().size())
                .sum();

        if (totalLessons == 0) {
            enrollment.setProgress(100.0);
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(Instant.now());
            enrollmentRepository.save(enrollment);
            issueCertificate(enrollment);
            return enrollment;
        }

        long completedLessons = enrollment.getLessonProgressList().stream()
                .filter(LessonProgress::isCompleted)
                .count();

        double progressPct = ((double) completedLessons / totalLessons) * 100.0;
        enrollment.setProgress(Math.round(progressPct * 100.0) / 100.0); // Round to 2 decimals

        if (completedLessons == totalLessons && !enrollment.isCompleted()) {
            enrollment.setCompleted(true);
            enrollment.setCompletedAt(Instant.now());
            issueCertificate(enrollment);
        } else if (completedLessons < totalLessons && enrollment.isCompleted()) {
            enrollment.setCompleted(false);
            enrollment.setCompletedAt(null);
            // Delete certificate if progress dropped back
            certificateRepository.findByStudentAndCourse(enrollment.getStudent(), enrollment.getCourse())
                    .ifPresent(certificateRepository::delete);
        }

        return enrollmentRepository.save(enrollment);
    }

    private void issueCertificate(Enrollment enrollment) {
        Optional<Certificate> existing = certificateRepository.findByStudentAndCourse(
                enrollment.getStudent(), enrollment.getCourse());

        if (existing.isEmpty()) {
            Certificate certificate = new Certificate();
            certificate.setStudent(enrollment.getStudent());
            certificate.setCourse(enrollment.getCourse());
            certificate.setCertificateUuid(UUID.randomUUID().toString());
            certificateRepository.save(certificate);
        }
    }

    public Certificate getCertificateByUuid(String uuid) {
        return certificateRepository.findByCertificateUuid(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "uuid", uuid));
    }

    public List<Certificate> getStudentCertificates(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));
        return certificateRepository.findByStudent(student);
    }
}
