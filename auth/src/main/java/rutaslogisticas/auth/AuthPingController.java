package rutaslogisticas.auth;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class AuthPingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "auth", "ok", "true");
    }
}
