package data.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "hotel_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HotelImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Integer imageId;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "is_main")
    private boolean isMain = false; // Ảnh đại diện chính

    @ManyToOne
    @JoinColumn(name = "hotel_id", referencedColumnName = "hotel_id")
    private Hotel hotel;
}
