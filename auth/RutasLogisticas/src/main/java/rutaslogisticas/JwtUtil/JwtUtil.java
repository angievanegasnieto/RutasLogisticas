/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.JwtUtil;

/**
 *
 * @author johan
 */


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
  private final Key key;
  private final long expiration;

  public JwtUtil(@Value("${app.jwt.secret}") String secret,
                 @Value("${app.jwt.expiration}") long expiration) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
    this.expiration = expiration;
  }

  public String generateToken(String subject, String role) {
    Date now = new Date();
    return Jwts.builder()
      .setSubject(subject)
      .claim("role", role)
      .setIssuedAt(now)
      .setExpiration(new Date(now.getTime() + expiration))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public Jws<Claims> parse(String token) {
    return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
  }
}

