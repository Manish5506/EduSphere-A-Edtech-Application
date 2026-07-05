package com.edtech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseDTO {
    private Long id;
    private String title;
    private String subtitle;
    private String description;
    private Double price;
    private String imageUrl;
    private String promoVideoUrl;
    private boolean published;
    private boolean approved;
    private Long instructorId;
    private String instructorName;
    private Long categoryId;
    private String categoryName;
    private List<SectionDTO> sections;
}
