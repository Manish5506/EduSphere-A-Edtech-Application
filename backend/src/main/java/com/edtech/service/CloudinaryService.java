package com.edtech.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private Cloudinary cloudinary;

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    private static final String UPLOAD_DIR = "uploads";

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(cloudName) && !cloudName.equalsIgnoreCase("placeholder") && !cloudName.isEmpty()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
        } else {
            // Create local upload folder for fallback
            try {
                Files.createDirectories(Paths.get(UPLOAD_DIR));
            } catch (IOException e) {
                System.err.println("Could not create local upload directory: " + e.getMessage());
            }
        }
    }

    public String uploadFile(MultipartFile file, String resourceType) throws IOException {
        if (this.cloudinary != null) {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap("resource_type", resourceType));
            return (String) uploadResult.get("secure_url");
        } else {
            // Fallback: Save locally
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(UPLOAD_DIR, fileName);
            Files.write(filePath, file.getBytes());
            // Return a local URL
            return "/api/test/files/" + fileName;
        }
    }

    public String uploadImage(MultipartFile file) throws IOException {
        return uploadFile(file, "image");
    }

    public String uploadVideo(MultipartFile file) throws IOException {
        return uploadFile(file, "video");
    }
}
