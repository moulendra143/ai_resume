package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.ATSAnalysisRepository;
import com.example.backend.repository.ActivityLogRepository;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ATSAnalysisRepository atsAnalysisRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminController(UserRepository userRepository,
                           ResumeRepository resumeRepository,
                           ATSAnalysisRepository atsAnalysisRepository,
                           ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.atsAnalysisRepository = atsAnalysisRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.findAll().stream().filter(User::getIsActive).count());
        stats.put("resumesCreated", resumeRepository.count());
        stats.put("atsAnalysesGenerated", atsAnalysisRepository.count());
        stats.put("activityLogs", activityLogRepository.count());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<MessageResponse> updateUserStatus(@PathVariable Long id, @RequestParam boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsActive(active);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("User status updated"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<MessageResponse> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User removed successfully"));
    }
}
