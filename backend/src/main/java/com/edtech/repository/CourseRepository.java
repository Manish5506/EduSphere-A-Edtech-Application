package com.edtech.repository;

import com.edtech.entity.Course;
import com.edtech.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstructor(User instructor);
    List<Course> findByPublishedTrueAndApprovedTrue();
    List<Course> findByCategoryIdAndPublishedTrueAndApprovedTrue(Long categoryId);

    @Query("SELECT c FROM Course c WHERE c.published = true AND c.approved = true AND " +
           "(c.title LIKE :searchQuery OR c.subtitle LIKE :searchQuery)")
    List<Course> searchCourses(@Param("searchQuery") String searchQuery);

    List<Course> findByApprovedFalse();
    boolean existsByCategoryId(Long categoryId);
}
