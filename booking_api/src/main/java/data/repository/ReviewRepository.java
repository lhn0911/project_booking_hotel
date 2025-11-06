package data.repository;

import data.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    
    List<Review> findByRoom_RoomId(Integer roomId);
    
    List<Review> findByUser_UserId(Integer userId);
    
    List<Review> findByRoom_RoomIdOrderByCreatedAtDesc(Integer roomId);
    
    boolean existsByUser_UserIdAndRoom_RoomId(Integer userId, Integer roomId);
    
    Review findByReviewId(Integer reviewId);
}

