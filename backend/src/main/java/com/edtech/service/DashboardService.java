package com.edtech.service;

import com.edtech.dto.DashboardStatsDTO;
import com.edtech.entity.Course;
import com.edtech.entity.ERole;
import com.edtech.entity.Enrollment;
import com.edtech.entity.Order;
import com.edtech.repository.CourseRepository;
import com.edtech.repository.EnrollmentRepository;
import com.edtech.repository.OrderRepository;
import com.edtech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private OrderRepository orderRepository;

    public DashboardStatsDTO getDashboardStats(Long userId, String role) {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setRecentActivities(new ArrayList<>());

        if (role.equalsIgnoreCase("admin") || role.equalsIgnoreCase("role_admin")) {
            long totalUsers = userRepository.count();
            
            long totalInstructors = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_INSTRUCTOR))
                    .count();

            long totalStudents = userRepository.findAll().stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName() == ERole.ROLE_STUDENT))
                    .count();

            long totalCourses = courseRepository.count();

            double totalRevenue = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus().equalsIgnoreCase("PAID"))
                    .mapToDouble(Order::getAmount)
                    .sum();

            stats.setTotalUsers(totalUsers);
            stats.setTotalInstructors(totalInstructors);
            stats.setTotalStudents(totalStudents);
            stats.setTotalCourses(totalCourses);
            stats.setTotalRevenue(totalRevenue);

        } else if (role.equalsIgnoreCase("instructor") || role.equalsIgnoreCase("role_instructor")) {
            List<Course> instructorCourses = courseRepository.findAll().stream()
                    .filter(c -> c.getInstructor().getId().equals(userId))
                    .toList();

            long coursesCount = instructorCourses.size();
            long studentsCount = 0;
            double earnings = 0.0;

            for (Course course : instructorCourses) {
                // Find how many enrollments exist for this course
                long enrCount = enrollmentRepository.findAll().stream()
                        .filter(e -> e.getCourse().getId().equals(course.getId()))
                        .count();
                studentsCount += enrCount;
                earnings += (enrCount * course.getPrice());
            }

            stats.setMyCoursesCount(coursesCount);
            stats.setMyStudentsCount(studentsCount);
            stats.setMyEarnings(earnings);

        } else {
            // Student stats
            List<Enrollment> enrollments = enrollmentRepository.findAll().stream()
                    .filter(e -> e.getStudent().getId().equals(userId))
                    .toList();

            long enrCount = enrollments.size();
            long completedCount = enrollments.stream().filter(Enrollment::isCompleted).count();

            stats.setMyEnrollmentsCount(enrCount);
            stats.setCompletedCoursesCount(completedCount);
        }

        return stats;
    }
}
