package rutaslogisticas.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    @Test
    void generateAndParseToken_shouldReturnClaims() {
        // Use a 32-byte secret for HS256
        String secret = "01234567890123456789012345678901"; // 32 chars
        long expiration = 1000L * 60 * 10; // 10 minutes

        JwtUtil jwtUtil = new JwtUtil(secret, expiration);

        String subject = "test-user";
        String role = "ROLE_USER";

        String token = jwtUtil.generateToken(subject, role);
        assertNotNull(token);

        Jws<Claims> parsed = jwtUtil.parse(token);
        assertEquals(subject, parsed.getBody().getSubject());
        assertEquals(role, parsed.getBody().get("role"));
    }
}
