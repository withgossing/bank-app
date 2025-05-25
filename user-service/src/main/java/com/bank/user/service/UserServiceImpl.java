package com.bank.user.service;

import com.bank.user.dto.*;
import com.bank.user.entity.User;
import com.bank.user.exception.DuplicateResourceException;
import com.bank.user.exception.ResourceNotFoundException;
import com.bank.user.exception.BadCredentialsException;
import com.bank.user.repository.UserRepository;
import com.bank.user.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 서비스 구현체
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Override
    public UserResponse register(UserRegisterRequest request) {
        log.info("사용자 등록 요청: {}", request.getUsername());
        
        // 중복 검사
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("이미 존재하는 사용자명입니다: " + request.getUsername());
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("이미 존재하는 이메일입니다: " + request.getEmail());
        }
        
        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .isActive(true)
                .build();
        
        User savedUser = userRepository.save(user);
        log.info("사용자 등록 완료: {}", savedUser.getId());
        
        return mapToUserResponse(savedUser);
    }
    
    @Override
    public LoginResponse login(LoginRequest request) {
        log.info("로그인 시도: {}", request.getUsername());
        
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("잘못된 사용자명 또는 비밀번호입니다"));
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("잘못된 사용자명 또는 비밀번호입니다");
        }
        
        if (!user.getIsActive()) {
            throw new BadCredentialsException("비활성화된 계정입니다");
        }
        
        // JWT 토큰 생성
        String accessToken = jwtTokenProvider.createAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getId());
        
        log.info("로그인 성공: {}", user.getId());
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenValidityInSeconds())
                .user(mapToUserResponse(user))
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        return mapToUserResponse(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + username));
        
        return mapToUserResponse(user);
    }
    
    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        log.info("사용자 정보 수정: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        // 비밀번호 변경 시 현재 비밀번호 확인
        if (request.getNewPassword() != null) {
            if (request.getCurrentPassword() == null || 
                !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadCredentialsException("현재 비밀번호가 일치하지 않습니다");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }
        
        // 이메일 변경 시 중복 검사
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateResourceException("이미 존재하는 이메일입니다: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        
        // 기타 정보 수정
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        User updatedUser = userRepository.save(user);
        log.info("사용자 정보 수정 완료: {}", updatedUser.getId());
        
        return mapToUserResponse(updatedUser);
    }
    
    @Override
    public void deleteUser(Long id) {
        log.info("사용자 삭제 요청: {}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        // 실제 삭제 대신 비활성화
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("사용자 비활성화 완료: {}", id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
