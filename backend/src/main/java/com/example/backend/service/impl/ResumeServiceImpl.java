package com.example.backend.service.impl;

import com.example.backend.entity.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.repository.ResumeVersionRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.ResumeService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final ResumeVersionRepository resumeVersionRepository;
    private final ObjectMapper objectMapper;

    public ResumeServiceImpl(ResumeRepository resumeRepository,
                             UserRepository userRepository,
                             ResumeVersionRepository resumeVersionRepository,
                             ObjectMapper objectMapper) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.resumeVersionRepository = resumeVersionRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Resume createResume(Resume resume) {
        Resume current = attachCurrentUser(resume);
        Resume saved = resumeRepository.save(current);
        saveVersion(saved, "Initial version");
        return saved;
    }

    @Override
    public Resume updateResume(Resume resume) {
        Resume existing = getResume(resume.getId());
        existing.setTitle(resume.getTitle());
        existing.setTemplate(resume.getTemplate());
        existing.setFullName(resume.getFullName());
        existing.setEmail(resume.getEmail());
        existing.setPhone(resume.getPhone());
        existing.setAddress(resume.getAddress());
        existing.setLinkedinUrl(resume.getLinkedinUrl());
        existing.setGithubUrl(resume.getGithubUrl());
        existing.setLeetcodeUrl(resume.getLeetcodeUrl());
        existing.setPortfolioUrl(resume.getPortfolioUrl());
        existing.setCourses(resume.getCourses());
        existing.setProfessionalSummary(resume.getProfessionalSummary());
        existing.setCareerObjective(resume.getCareerObjective());
        existing.setLanguages(resume.getLanguages());
        existing.setInterests(resume.getInterests());
        existing.setReferencesInfo(resume.getReferencesInfo());
        existing.setIsPublic(resume.getIsPublic());
        existing.setPublicLink(resume.getPublicLink());
        existing.setDownloadCount(resume.getDownloadCount());
        existing.setViewCount(resume.getViewCount());
        existing.getEducations().clear();
        if (resume.getEducations() != null) {
            existing.getEducations().addAll(cloneEducations(resume.getEducations(), existing));
        }
        existing.getExperiences().clear();
        if (resume.getExperiences() != null) {
            existing.getExperiences().addAll(cloneExperiences(resume.getExperiences(), existing));
        }
        existing.getProjects().clear();
        if (resume.getProjects() != null) {
            existing.getProjects().addAll(cloneProjects(resume.getProjects(), existing));
        }
        existing.getSkills().clear();
        if (resume.getSkills() != null) {
            existing.getSkills().addAll(cloneSkills(resume.getSkills(), existing));
        }
        existing.getCertifications().clear();
        if (resume.getCertifications() != null) {
            existing.getCertifications().addAll(cloneCertifications(resume.getCertifications(), existing));
        }
        existing.getAchievements().clear();
        if (resume.getAchievements() != null) {
            existing.getAchievements().addAll(cloneAchievements(resume.getAchievements(), existing));
        }

        Resume saved = resumeRepository.save(existing);
        saveVersion(saved, "Updated version");
        return saved;
    }

    @Override
    public void deleteResume(Long resumeId) {
        Resume resume = getResume(resumeId);
        resumeRepository.delete(resume);
    }

    @Override
    public Resume getResume(Long resumeId) {
        return resumeRepository.findById(resumeId)
                .orElseThrow(() -> new ResourceNotFoundException("Resume", "id", resumeId));
    }

    @Override
    public List<Resume> getCurrentUserResumes() {
        User user = getAuthenticatedUser();
        return resumeRepository.findByUserOrderByUpdatedAtDesc(user);
    }

    @Override
    public Resume duplicateResume(Long resumeId) {
        Resume original = getResume(resumeId);
        Resume duplicate = Resume.builder()
                .user(original.getUser())
                .title(original.getTitle() + " Copy")
                .template(original.getTemplate())
                .fullName(original.getFullName())
                .email(original.getEmail())
                .phone(original.getPhone())
                .address(original.getAddress())
                .linkedinUrl(original.getLinkedinUrl())
                .githubUrl(original.getGithubUrl())
                .leetcodeUrl(original.getLeetcodeUrl())
                .portfolioUrl(original.getPortfolioUrl())
                .courses(original.getCourses())
                .professionalSummary(original.getProfessionalSummary())
                .careerObjective(original.getCareerObjective())
                .languages(original.getLanguages())
                .interests(original.getInterests())
                .referencesInfo(original.getReferencesInfo())
                .isPublic(false)
                .publicLink(null)
                .downloadCount(0)
                .viewCount(0)
                .build();

        duplicate = resumeRepository.save(duplicate);
        duplicate.getEducations().clear();
        if (original.getEducations() != null) {
            duplicate.getEducations().addAll(cloneEducations(original.getEducations(), duplicate));
        }
        duplicate.getExperiences().clear();
        if (original.getExperiences() != null) {
            duplicate.getExperiences().addAll(cloneExperiences(original.getExperiences(), duplicate));
        }
        duplicate.getProjects().clear();
        if (original.getProjects() != null) {
            duplicate.getProjects().addAll(cloneProjects(original.getProjects(), duplicate));
        }
        duplicate.getSkills().clear();
        if (original.getSkills() != null) {
            duplicate.getSkills().addAll(cloneSkills(original.getSkills(), duplicate));
        }
        duplicate.getCertifications().clear();
        if (original.getCertifications() != null) {
            duplicate.getCertifications().addAll(cloneCertifications(original.getCertifications(), duplicate));
        }
        duplicate.getAchievements().clear();
        if (original.getAchievements() != null) {
            duplicate.getAchievements().addAll(cloneAchievements(original.getAchievements(), duplicate));
        }
        return resumeRepository.save(duplicate);
    }

    private Resume attachCurrentUser(Resume resume) {
        User user = getAuthenticatedUser();
        resume.setUser(user);
        if (resume.getEducations() != null) resume.setEducations(cloneEducations(resume.getEducations(), resume));
        if (resume.getExperiences() != null) resume.setExperiences(cloneExperiences(resume.getExperiences(), resume));
        if (resume.getProjects() != null) resume.setProjects(cloneProjects(resume.getProjects(), resume));
        if (resume.getSkills() != null) resume.setSkills(cloneSkills(resume.getSkills(), resume));
        if (resume.getCertifications() != null) resume.setCertifications(cloneCertifications(resume.getCertifications(), resume));
        if (resume.getAchievements() != null) resume.setAchievements(cloneAchievements(resume.getAchievements(), resume));
        return resume;
    }

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails details)) {
            throw new RuntimeException("Unauthenticated access");
        }
        return userRepository.findByEmail(details.getEmail()).orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private void saveVersion(Resume resume, String label) {
        try {
            // Use a simple snapshot map to avoid circular Resume<->User serialization
            java.util.Map<String, Object> snapshot = new java.util.LinkedHashMap<>();
            snapshot.put("id", resume.getId());
            snapshot.put("title", resume.getTitle());
            snapshot.put("template", resume.getTemplate());
            snapshot.put("fullName", resume.getFullName());
            snapshot.put("email", resume.getEmail());
            snapshot.put("phone", resume.getPhone());
            snapshot.put("professionalSummary", resume.getProfessionalSummary());
            snapshot.put("careerObjective", resume.getCareerObjective());
            String content = objectMapper.writeValueAsString(snapshot);
            ResumeVersion version = ResumeVersion.builder()
                    .resume(resume)
                    .versionLabel(label)
                    .content(content)
                    .build();
            resumeVersionRepository.save(version);
        } catch (Throwable ignored) {
            // Silently ignore version snapshot failures – they must not block resume save
        }
    }

    private List<Education> cloneEducations(List<Education> educations, Resume resume) {
        if (educations == null) return List.of();
        return educations.stream().map(e -> Education.builder()
                .resume(resume)
                .institution(e.getInstitution())
                .degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .description(e.getDescription())
                .build()).collect(Collectors.toList());
    }

    private List<Experience> cloneExperiences(List<Experience> experiences, Resume resume) {
        if (experiences == null) return List.of();
        return experiences.stream().map(e -> Experience.builder()
                .resume(resume)
                .companyName(e.getCompanyName())
                .jobTitle(e.getJobTitle())
                .location(e.getLocation())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .description(e.getDescription())
                .sortOrder(e.getSortOrder())
                .build()).collect(Collectors.toList());
    }

    private List<Project> cloneProjects(List<Project> projects, Resume resume) {
        if (projects == null) return List.of();
        return projects.stream().map(p -> Project.builder()
                .resume(resume)
                .projectName(p.getProjectName())
                .description(p.getDescription())
                .technologiesUsed(p.getTechnologiesUsed())
                .projectUrl(p.getProjectUrl())
                .githubUrl(p.getGithubUrl())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .sortOrder(p.getSortOrder())
                .build()).collect(Collectors.toList());
    }

    private List<Skill> cloneSkills(List<Skill> skills, Resume resume) {
        if (skills == null) return List.of();
        return skills.stream().map(s -> Skill.builder()
                .resume(resume)
                .skillName(s.getSkillName())
                .category(s.getCategory())
                .proficiencyLevel(s.getProficiencyLevel())
                .sortOrder(s.getSortOrder())
                .build()).collect(Collectors.toList());
    }

    private List<Certification> cloneCertifications(List<Certification> certifications, Resume resume) {
        if (certifications == null) return List.of();
        return certifications.stream().map(c -> Certification.builder()
                .resume(resume)
                .certificationName(c.getCertificationName())
                .issuingOrganization(c.getIssuingOrganization())
                .issueDate(c.getIssueDate())
                .expiryDate(c.getExpiryDate())
                .credentialId(c.getCredentialId())
                .credentialUrl(c.getCredentialUrl())
                .sortOrder(c.getSortOrder())
                .build()).collect(Collectors.toList());
    }

    private List<Achievement> cloneAchievements(List<Achievement> achievements, Resume resume) {
        if (achievements == null) return List.of();
        return achievements.stream().map(a -> Achievement.builder()
                .resume(resume)
                .title(a.getTitle())
                .description(a.getDescription())
                .build()).collect(Collectors.toList());
    }
}
