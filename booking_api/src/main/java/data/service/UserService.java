package data.service;

import data.dto.request.UserLogin;
import data.dto.request.UserRegister;
import data.dto.response.JWTResponse;
import data.entity.User;

public interface UserService {
    User registerUser(UserRegister userRegister);
    void setPassword(String phoneNumber, String password);
    JWTResponse login(UserLogin userLogin);
    public User getCurrentUser();
}
