package rutaslogisticas;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class LogisticsController {
   @GetMapping("/ping")
    public Map<String, String> ping() {
        return Map.of("service", "logistics", "ok", "true");
    }
}
