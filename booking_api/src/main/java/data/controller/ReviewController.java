package data.controller;

import data.dto.request.ReviewRequest;
import data.dto.response.APIResponse;
import data.dto.response.ReviewResponseDTO;
import data.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:8081")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<APIResponse<ReviewResponseDTO>> createReview(@Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponseDTO review = reviewService.createReview(request);
            return ResponseEntity.ok(APIResponse.success(review, "Đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<APIResponse<List<ReviewResponseDTO>>> getReviewsByRoomId(@PathVariable Integer roomId) {
        try {
            List<ReviewResponseDTO> reviews = reviewService.getReviewsByRoomId(roomId);
            return ResponseEntity.ok(APIResponse.success(reviews, "Lấy danh sách đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }
    
    @GetMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponseDTO>> getReviewById(@PathVariable Integer reviewId) {
        try {
            ReviewResponseDTO review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(APIResponse.success(review, "Lấy thông tin đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(APIResponse.error(e.getMessage(), null));
        }
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponseDTO>> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody ReviewRequest request) {
        try {
            ReviewResponseDTO updatedReview = reviewService.updateReview(reviewId, request);
            return ResponseEntity.ok(APIResponse.success(updatedReview, "Cập nhật đánh giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(APIResponse.error(e.getMessage(), null));
        }
    }
}

