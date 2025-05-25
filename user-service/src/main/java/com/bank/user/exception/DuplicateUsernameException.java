package com.bank.user.exception;

/**
 * 중복된 사용자명일 때 발생하는 예외
 */
public class DuplicateUsernameException extends RuntimeException {
    
    public DuplicateUsernameException(String message) {
        super(message);
    }
    
    public DuplicateUsernameException(String message, Throwable cause) {
        super(message, cause);
    }
}
