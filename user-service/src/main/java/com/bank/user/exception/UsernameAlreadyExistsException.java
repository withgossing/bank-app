package com.bank.user.exception;

/**
 * 사용자명이 이미 존재할 때 발생하는 예외
 */
public class UsernameAlreadyExistsException extends RuntimeException {
    
    public UsernameAlreadyExistsException(String message) {
        super(message);
    }
    
    public UsernameAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
