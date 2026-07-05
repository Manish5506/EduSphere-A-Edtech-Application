package com.edtech.repository;

import com.edtech.entity.Certificate;
import com.edtech.entity.Course;
import com.edtech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByCertificateUuid(String uuid);
    Optional<Certificate> findByStudentAndCourse(User student, Course course);
    List<Certificate> findByStudent(User student);
}
