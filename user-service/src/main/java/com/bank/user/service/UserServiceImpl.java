package com.bank.user.service;

import com.bank.user.domain.User;
import com.bank.user.dto.LoginRequest;
import com.bank.user.dto.LoginResponse;
import com.bank.user.dto.UserDto;
import com.bank.user.dto.UserRegistrationDto;
import com.bank.user.exception.UserNotFoundException;
import com.bank.user.exception.UsernameAlreadyExistsException;
import com.bank.user.exception.EmailAlreadyExistsException;
import com.bank.user.mapper.UserMapper;
import com.bank.user.repository.UserRepository;
import com.bank.user.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자 서비스 구현체
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final RabbitTemplate rabbitTemplate;
    
    @Override
    @Transactional
    public UserDto registerUser(UserRegistrationDto registrationDto) {
        log.info("사용자 등록 시작: {}", registrationDto.getUsername());
        
        // 중복 체크
        if (userRepository.existsByUsername(registrationDto.getUsername())) {
            throw new UsernameAlreadyExistsException("이미 사용중인 사용자 이름입니다: " + registrationDto.getUsername());
        }
        
        if (userRepository.existsByEmail(registrationDto.getEmail())) {
            throw new EmailAlreadyExistsException("이미 사용중인 이메일입니다: " + registrationDto.getEmail());
        }
        
        // 사용자 생성
        User user = User.builder()
                .username(registrationDto.getUsername())
                .password(passwordEncoder.encode(registrationDto.getPassword()))
                .email(registrationDto.getEmail())
                .fullName(registrationDto.getFullName())
                .phoneNumber(registrationDto.getPhoneNumber())
                .isActive(true)
                .build();
        
        User savedUser = userRepository.save(user);
        
        // 이벤트 발행 (RabbitMQ)
        rabbitTemplate.convertAndSend("user.exchange", "user.created", savedUser.getId());
        
        log.info("사용자 등록 완료: {}", savedUser.getUsername());
        return userMapper.toDto(savedUser);
    }
    
    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        log.info("로그인 시도: {}", loginRequest.getUsername());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        User user = (User) authentication.getPrincipal();
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        log.info("로그인 성공: {}", user.getUsername());
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getAccessTokenExpiration())
                .user(userMapper.toDto(user))
                .build();
    }
    
    @Override
    public UserDto getUserById(Long id) {
        log.debug("사용자 조회: ID={}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        return userMapper.toDto(user);
    }
    
    @Override
    public UserDto getUserByUsername(String username) {
        log.debug("사용자 조회: username={}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + username));
        return userMapper.toDto(user);
    }
    
    @Override
    @Transactional
    public UserDto updateUser(Long id, UserDto userDto) {
        log.info("사용자 정보 수정: ID={}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        // 이메일 중복 체크 (다른 사용자가 사용 중인 경우)
        if (!user.getEmail().equals(userDto.getEmail()) && 
            userRepository.existsByEmail(userDto.getEmail())) {
            throw new EmailAlreadyExistsException("이미 사용중인 이메일입니다: " + userDto.getEmail());
        }
        
        user.setEmail(userDto.getEmail());
        user.setFullName(userDto.getFullName());
        user.setPhoneNumber(userDto.getPhoneNumber());
        
        User updatedUser = userRepository.save(user);
        
        // 이벤트 발행
        rabbitTemplate.convertAndSend("user.exchange", "user.updated", updatedUser.getId());
        
        log.info("사용자 정보 수정 완료: {}", updatedUser.getUsername());
        return userMapper.toDto(updatedUser);
    }
    
    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("사용자 삭제: ID={}", id);
        
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("사용자를 찾을 수 없습니다: " + id));
        
        // Soft delete
        user.setIsActive(false);
        userRepository.save(user);
        
        // 이벤트 발행
        rabbitTemplate.convertAndSend("user.exchange", "user.deleted", id);
        
        log.info("사용자 삭제 완료: {}", user.getUsername());
    }
    
    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
