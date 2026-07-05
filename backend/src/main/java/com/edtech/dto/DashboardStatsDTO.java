package com.edtech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Admin Stats
    private Long totalUsers;
    private Long totalInstructors;
    private Long totalStudents;
    private Double totalRevenue;
    private Long totalCourses;

    // Instructor Stats
    private Long myCoursesCount;
    private Long myStudentsCount;
    private Double myEarnings;

    // Student Stats
    private Long myEnrollmentsCount;
    private Long completedCoursesCount;

    // Dynamic lists for graphs/recent items
    private List<?> recentActivities;
}
