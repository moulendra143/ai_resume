package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Resume resume;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "category")
    private String category;

    @Column(name = "proficiency_level")
    @Builder.Default
    private String proficiencyLevel = "INTERMEDIATE";

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;
}
