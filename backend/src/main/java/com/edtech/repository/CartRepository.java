package com.edtech.repository;

import com.edtech.entity.Cart;
import com.edtech.entity.Course;
import com.edtech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByStudent(User student);
    Optional<Cart> findByStudentAndCourse(User student, Course course);
    boolean existsByStudentAndCourse(User student, Course course);
    void deleteByStudentAndCourse(User student, Course course);
    void deleteByStudent(User student);
}
