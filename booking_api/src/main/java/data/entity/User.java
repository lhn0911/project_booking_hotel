package data.entity;


import data.utils.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name="gender")
    private String gender;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = false;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Otp otp;


//    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = false)
//    private List<Article> articles = new ArrayList<>();
//
//    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = false)
//    private List<UserExam> userExams = new ArrayList<>();
//
//    @OneToOne(mappedBy = "user")
//    private Otp otp;

}

