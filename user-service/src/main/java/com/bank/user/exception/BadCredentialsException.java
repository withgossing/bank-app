package com.bank.user.exception;

/**
 * 잘못된 인증 정보를 제공했을 때 발생하는 예외
 */
public class BadCredentialsException extends RuntimeException {
    
    public BadCredentialsException(String message) {
        super(message);
    }
    
    public BadCredentialsException(String message, Throwable cause) {
        super(message, cause);
    }
}
