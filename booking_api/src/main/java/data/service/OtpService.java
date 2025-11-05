package data.service;

import data.entity.Otp;
import data.entity.User;

public interface OtpService {
    String generateOtpCode();
    Otp createOtp(User user);
    boolean verifyOtp(String otpCode, String phoneNumber);
    void sendOtpSms(String phoneNumber, String otpCode);
    void resendOtp(String phoneNumber);
    void deleteOtp(User user);
}
