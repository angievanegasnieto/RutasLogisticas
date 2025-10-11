package com.yourorg.logistics.web;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
@RestControllerAdvice
public class RestExceptionHandler {
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<?> badReq(IllegalArgumentException ex){ return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage()); }
}
