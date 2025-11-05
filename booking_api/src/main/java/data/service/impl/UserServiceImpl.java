package data.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import data.dto.request.UserLogin;
import data.dto.request.UserRegister;
import data.dto.response.JWTResponse;
import data.entity.Otp;
import data.entity.User;
import data.repository.OtpRepository;
import data.repository.UserRepository;
import data.security.jwt.JWTProvider;
import data.security.pricipal.CustomUserDetails;
import data.service.OtpService;
import data.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JWTProvider jwtProvider;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private OtpService otpService;
    @Autowired
    private OtpRepository otpRepository;

    @Override
    @Transactional
    public User registerUser(UserRegister userRegister) {
        if (userRepository.existsByEmail(userRegister.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }
        if (userRepository.existsByPhoneNumber(userRegister.getPhoneNumber())) {
            throw new RuntimeException("Số điện thoại đã tồn tại");
        }
        
        // Tạo password tạm thời (sẽ được thay đổi sau khi verify OTP và set password)
        String tempPassword = "TEMP_PASSWORD_" + System.currentTimeMillis();
        
        User user = User.builder()
                .fullName(userRegister.getFullName())
                .passwordHash(passwordEncoder.encode(tempPassword))
                .email(userRegister.getEmail())
                .phoneNumber(userRegister.getPhoneNumber())
                .dateOfBirth(userRegister.getDateOfBirth())
                .gender(userRegister.getGender())
                .enabled(false) // Chưa được kích hoạt cho đến khi verify OTP và set password
                .build();
        userRepository.save(user);
        
        // Tạo và gửi OTP
        otpService.createOtp(user);
        
        log.info("User registered: {}, waiting for OTP verification", user.getEmail());
        return user;
    }

    @Override
    @Transactional
    public void setPassword(String phoneNumber, String password) {
        User user = userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Otp otp = otpRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã OTP. Vui lòng xác thực OTP trước."));

        if (!otp.isVerified()) {
            throw new RuntimeException("Vui lòng xác thực OTP trước khi đặt mật khẩu");
        }

        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEnabled(true);
        userRepository.save(user);

        // Xóa OTP theo user thay vì xóa instance đang managed
        otpRepository.deleteByUser(user);

        log.info("Password set successfully for user: {}", phoneNumber);
    }


    @Override
    public JWTResponse login(UserLogin userLogin) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userLogin.getEmail(), userLogin.getPassword()));
        } catch (AuthenticationException e) {
            log.error("Sai email hoặc password!");
            throw new RuntimeException("Đăng nhập thất bại!");
        }
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        return JWTResponse.builder()
                .fullName(userDetails.getFullName())
                .email(userDetails.getEmail())
                .build();
    }

    @Override
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

    }
}
