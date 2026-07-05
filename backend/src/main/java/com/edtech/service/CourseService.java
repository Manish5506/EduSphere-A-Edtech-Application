package com.edtech.service;

import com.edtech.dto.CategoryDTO;
import com.edtech.dto.CourseDTO;
import com.edtech.dto.LessonDTO;
import com.edtech.dto.SectionDTO;
import com.edtech.entity.*;
import com.edtech.exception.ResourceNotFoundException;
import com.edtech.exception.BadRequestException;
import com.edtech.repository.CategoryRepository;
import com.edtech.repository.CourseRepository;
import com.edtech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    // --- CATEGORY OPERATIONS ---

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToCategoryDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        Category category = new Category();
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setSlug(dto.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        return mapToCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));

        if (courseRepository.existsByCategoryId(categoryId)) {
            throw new BadRequestException("Cannot delete category because it contains courses. Re-assign or delete those courses first!");
        }

        categoryRepository.delete(category);
    }

    // --- COURSE OPERATIONS ---

    public List<CourseDTO> getApprovedCourses() {
        return courseRepository.findByPublishedTrueAndApprovedTrue().stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByCategory(Long categoryId) {
        return courseRepository.findByCategoryIdAndPublishedTrueAndApprovedTrue(categoryId).stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> searchCourses(String query) {
        String queryLike = "%" + query + "%";
        return courseRepository.searchCourses(queryLike).stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getInstructorCourses(Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", instructorId));
        return courseRepository.findByInstructor(instructor).stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getPendingCourses() {
        return courseRepository.findByApprovedFalse().stream()
                .map(this::mapToCourseDTO)
                .collect(Collectors.toList());
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return mapToCourseDTO(course);
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO dto, Long instructorId) {
        User instructor = userRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", instructorId));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setSubtitle(dto.getSubtitle());
        course.setDescription(dto.getDescription());
        course.setPrice(dto.getPrice());
        course.setImageUrl(dto.getImageUrl());
        course.setPromoVideoUrl(dto.getPromoVideoUrl());
        course.setInstructor(instructor);
        course.setCategory(category);
        course.setPublished(false);
        course.setApproved(false);

        return mapToCourseDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO updateCourse(Long courseId, CourseDTO dto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId()));

        course.setTitle(dto.getTitle());
        course.setSubtitle(dto.getSubtitle());
        course.setDescription(dto.getDescription());
        course.setPrice(dto.getPrice());
        course.setImageUrl(dto.getImageUrl());
        course.setPromoVideoUrl(dto.getPromoVideoUrl());
        course.setCategory(category);
        
        return mapToCourseDTO(courseRepository.save(course));
    }

    @Transactional
    public void publishCourse(Long courseId, boolean published) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        course.setPublished(published);
        courseRepository.save(course);
    }

    @Transactional
    public void approveCourse(Long courseId, boolean approved) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        course.setApproved(approved);
        // Auto-publish when approved so it appears in public listings
        if (approved) {
            course.setPublished(true);
        }
        courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        // 1. Delete associated lesson progress
        entityManager.createNativeQuery("DELETE FROM lesson_progress WHERE enrollment_id IN (SELECT id FROM enrollments WHERE course_id = ?1)")
                .setParameter(1, courseId)
                .executeUpdate();

        // 2. Delete associated enrollments
        entityManager.createNativeQuery("DELETE FROM enrollments WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        // 3. Delete from carts
        entityManager.createNativeQuery("DELETE FROM carts WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        // 4. Delete from wishlists
        entityManager.createNativeQuery("DELETE FROM wishlists WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        // 5. Delete from reviews
        entityManager.createNativeQuery("DELETE FROM reviews WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        // 6. Delete from certificates
        entityManager.createNativeQuery("DELETE FROM certificates WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        // 7. Delete from order_courses (join table)
        entityManager.createNativeQuery("DELETE FROM order_courses WHERE course_id = ?1")
                .setParameter(1, courseId)
                .executeUpdate();

        courseRepository.delete(course);
    }

    // --- SECTIONS & LESSONS MANAGEMENT ---

    @Transactional
    public CourseDTO addSection(Long courseId, SectionDTO sectionDTO) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        Section section = new Section();
        section.setTitle(sectionDTO.getTitle());
        section.setSortOrder(sectionDTO.getSortOrder() != null ? sectionDTO.getSortOrder() : course.getSections().size() + 1);
        section.setCourse(course);
        course.getSections().add(section);

        return mapToCourseDTO(courseRepository.save(course));
    }

    @Transactional
    public CourseDTO addLesson(Long courseId, Long sectionId, LessonDTO lessonDTO) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        
        Section section = course.getSections().stream()
                .filter(s -> s.getId().equals(sectionId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Section", "id", sectionId));

        Lesson lesson = new Lesson();
        lesson.setTitle(lessonDTO.getTitle());
        lesson.setContent(lessonDTO.getContent());
        lesson.setVideoUrl(lessonDTO.getVideoUrl());
        lesson.setVideoDuration(lessonDTO.getVideoDuration());
        lesson.setFreePreview(lessonDTO.isFreePreview());
        lesson.setSortOrder(lessonDTO.getSortOrder() != null ? lessonDTO.getSortOrder() : section.getLessons().size() + 1);
        lesson.setSection(section);
        section.getLessons().add(lesson);

        return mapToCourseDTO(courseRepository.save(course));
    }

    // --- MAPPERS ---

    public CategoryDTO mapToCategoryDTO(Category category) {
        return new CategoryDTO(category.getId(), category.getName(), category.getDescription(), category.getSlug());
    }

    public CourseDTO mapToCourseDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setSubtitle(course.getSubtitle());
        dto.setDescription(course.getDescription());
        dto.setPrice(course.getPrice());
        dto.setImageUrl(course.getImageUrl());
        dto.setPromoVideoUrl(course.getPromoVideoUrl());
        dto.setPublished(course.isPublished());
        dto.setApproved(course.isApproved());
        dto.setInstructorId(course.getInstructor().getId());
        dto.setInstructorName(course.getInstructor().getFirstName() + " " + course.getInstructor().getLastName());
        dto.setCategoryId(course.getCategory().getId());
        dto.setCategoryName(course.getCategory().getName());

        if (course.getSections() != null) {
            dto.setSections(course.getSections().stream()
                    .map(this::mapToSectionDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setSections(new ArrayList<>());
        }
        return dto;
    }

    public SectionDTO mapToSectionDTO(Section section) {
        SectionDTO dto = new SectionDTO();
        dto.setId(section.getId());
        dto.setTitle(section.getTitle());
        dto.setSortOrder(section.getSortOrder());

        if (section.getLessons() != null) {
            dto.setLessons(section.getLessons().stream()
                    .map(this::mapToLessonDTO)
                    .collect(Collectors.toList()));
        } else {
            dto.setLessons(new ArrayList<>());
        }
        return dto;
    }

    public LessonDTO mapToLessonDTO(Lesson lesson) {
        return new LessonDTO(
                lesson.getId(),
                lesson.getTitle(),
                lesson.getContent(),
                lesson.getVideoUrl(),
                lesson.getVideoDuration(),
                lesson.isFreePreview(),
                lesson.getSortOrder()
        );
    }
}
