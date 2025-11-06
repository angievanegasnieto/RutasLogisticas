package rutaslogisticas.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles", uniqueConstraints = @UniqueConstraint(columnNames = "plate"))
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plate;

    @Column
    private String model;

    @Column(length = 10)
    private String type; // AUTO | MOTO

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPlate() { return plate; }
    public void setPlate(String plate) { this.plate = plate; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
