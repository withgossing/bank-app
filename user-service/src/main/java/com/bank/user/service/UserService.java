package com.bank.user.service;

import com.bank.user.dto.LoginRequest;
import com.bank.user.dto.LoginResponse;
import com.bank.user.dto.UserRegisterRequest;
import com.bank.user.dto.UserResponse;
import com.bank.user.dto.UserUpdateRequest;
import com.bank.user.entity.User;
import com.bank.user.exception.DuplicateEmailException;
import com.bank.user.exception.DuplicateUsernameException;
import com.bank.user.exception.UserNotFoundException;
import com.bank.user.repository.UserRepository;
import com.bank.user.security.JwtTokenProvider;
import com.bank.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 사용자 서비스
 * 사용자 관련 비즈니스 로직 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RabbitTemplate rabbitTemplate;
    
    /**
     * 사용자 등록
     */
    @Transactional
    public UserResponse registerUser(UserRegisterRequest request) {
        // 중복 검사
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateUsernameException("이미 사용 중인 사용자명입니다: " + request.getUsername());
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("이미 사용 중인 이메일입니다: " + request.getEmail());
        }
        
        // 사용자 생성
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phoneNumber(request.getPhoneNumber())
                .build();
        
        User savedUser = userRepository.save(user);
        
        // 이벤트 발행 (RabbitMQ)
        publishUserCreatedEvent(savedUser);
        
        log.info("새로운 사용자 등록: {}", savedUser.getUsername());
        
        return UserResponse.from(savedUser);
    }
    
    /**
     * 로그인
     */
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        String accessToken = tokenProvider.generateAccessToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다"));
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration())
                .user(UserResponse.from(user))
                .build();
    }
    
    /**
     * 사용자 조회
     */
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        return UserResponse.from(user);
    }
    
    /**
     * 사용자 수정
     */
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        // 이메일 중복 검사
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException("이미 사용 중인 이메일입니다: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        
        User updatedUser = userRepository.save(user);
        
        log.info("사용자 정보 수정: {}", updatedUser.getUsername());
        
        return UserResponse.from(updatedUser);
    }
    
    /**
     * 사용자 삭제 (비활성화)
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("사용자 비활성화: {}", user.getUsername());
    }
    
    /**
     * 사용자 생성 이벤트 발행
     */
    private void publishUserCreatedEvent(User user) {
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventType", "USER_CREATED");
            event.put("userId", user.getId());
            event.put("username", user.getUsername());
            event.put("email", user.getEmail());
            event.put("timestamp", LocalDateTime.now());
            
            rabbitTemplate.convertAndSend("user.exchange", "user.created", event);
            log.info("사용자 생성 이벤트 발행: {}", user.getUsername());
        } catch (Exception e) {
            log.error("사용자 생성 이벤트 발행 실패", e);
        }
    }
}
