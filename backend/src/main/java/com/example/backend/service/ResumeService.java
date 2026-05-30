package com.example.backend.service;

import com.example.backend.entity.Resume;

import java.util.List;

public interface ResumeService {
    Resume createResume(Resume resume);
    Resume updateResume(Resume resume);
    void deleteResume(Long resumeId);
    Resume getResume(Long resumeId);
    List<Resume> getCurrentUserResumes();
    Resume duplicateResume(Long resumeId);
}
