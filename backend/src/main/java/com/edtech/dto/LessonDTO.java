package com.edtech.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LessonDTO {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private Double videoDuration;
    private boolean freePreview;
    private Integer sortOrder;
}
