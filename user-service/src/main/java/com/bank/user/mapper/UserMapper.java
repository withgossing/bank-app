package com.bank.user.mapper;

import com.bank.user.domain.User;
import com.bank.user.dto.UserDto;
import org.springframework.stereotype.Component;

/**
 * User 엔티티와 DTO 간의 변환을 담당하는 Mapper
 */
@Component
public class UserMapper {
    
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .isActive(user.getIsActive())
                .build();
    }
    
    public User toEntity(UserDto userDto) {
        if (userDto == null) {
            return null;
        }
        
        return User.builder()
                .id(userDto.getId())
                .username(userDto.getUsername())
                .email(userDto.getEmail())
                .fullName(userDto.getFullName())
                .phoneNumber(userDto.getPhoneNumber())
                .isActive(userDto.getIsActive())
                .build();
    }
}
