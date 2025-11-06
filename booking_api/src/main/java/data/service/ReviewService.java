package data.service;

import data.dto.request.ReviewRequest;
import data.dto.response.ReviewResponseDTO;

import java.util.List;

public interface ReviewService {
    ReviewResponseDTO createReview(ReviewRequest request);
    List<ReviewResponseDTO> getReviewsByRoomId(Integer roomId);
    List<ReviewResponseDTO> getReviewsByUserId(Integer userId);
    ReviewResponseDTO getReviewById(Integer reviewId);
    ReviewResponseDTO updateReview(Integer reviewId, ReviewRequest request);
}

