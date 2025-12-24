package com.project.auth.service;

import com.project.auth.dto.JwtResponse;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.SignupRequest;

public interface AuthService {
    JwtResponse registerUser(SignupRequest signupRequest);
    JwtResponse authenticateUser(LoginRequest loginRequest);
}





