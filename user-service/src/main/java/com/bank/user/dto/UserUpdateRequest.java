package com.bank.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 정보 수정 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @Size(max = 100, message = "이름은 100자를 초과할 수 없습니다")
    private String fullName;

    @Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다")
    private String phoneNumber;
}
