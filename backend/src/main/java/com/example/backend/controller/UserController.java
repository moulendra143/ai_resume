package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import com.example.backend.payload.user.UserProfileUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> me() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@Valid @RequestBody UserProfileUpdateRequest profile) {
        return ResponseEntity.ok(userService.updateProfile(profile));
    }

    @PostMapping("/profile-photo")
    public ResponseEntity<Map<String, String>> uploadProfilePhoto(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(Map.of("url", "/uploads/" + newFilename));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Could not upload file"));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        String result = userService.changePassword(email, oldPassword, newPassword);
        return ResponseEntity.ok(new MessageResponse(result));
    }

    @DeleteMapping
    public ResponseEntity<MessageResponse> deleteAccount() {
        userService.deleteCurrentUserAccount();
        return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(userService.buildDashboardMetrics());
    }
}
