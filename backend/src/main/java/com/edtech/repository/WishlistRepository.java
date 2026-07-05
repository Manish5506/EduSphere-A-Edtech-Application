package com.edtech.repository;

import com.edtech.entity.Course;
import com.edtech.entity.User;
import com.edtech.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByStudent(User student);
    Optional<Wishlist> findByStudentAndCourse(User student, Course course);
    boolean existsByStudentAndCourse(User student, Course course);
    void deleteByStudentAndCourse(User student, Course course);
}
