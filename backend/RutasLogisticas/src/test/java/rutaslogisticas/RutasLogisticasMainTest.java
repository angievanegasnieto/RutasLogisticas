package rutaslogisticas;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RutasLogisticasMainTest {

    @Test
    void mainClass_shouldExist() {
        // Sanity: the main application class should be loadable
        assertNotNull(new RutasLogisticas());
    }
}
