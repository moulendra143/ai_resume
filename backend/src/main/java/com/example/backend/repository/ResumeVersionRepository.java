package com.example.backend.repository;

import com.example.backend.entity.ResumeVersion;
import com.example.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeVersionRepository extends JpaRepository<ResumeVersion, Long> {
    List<ResumeVersion> findByResumeOrderByCreatedAtDesc(Resume resume);
}
