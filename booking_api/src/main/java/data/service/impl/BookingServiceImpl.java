package data.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import data.dto.request.BookingRequest;
import data.dto.response.BookingResponseDTO;
import data.entity.Bookings;
import data.entity.Room;
import data.entity.User;
import data.exception.NotFoundException;
import data.mapper.BookingMapper;
import data.repository.BookingRepository;
import data.repository.RoomRepository;
import data.service.BookingService;
import data.service.UserService;
import data.utils.BookingStatus;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserService userService;
    
    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequest request) {
        User user = userService.getCurrentUser();
        Room room = roomRepository.findById(request.getRoomId())
            .orElseThrow(() -> new NotFoundException("Không tìm thấy phòng với ID: " + request.getRoomId()));
        
        // Calculate number of nights
        long nights = java.time.temporal.ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new RuntimeException("Số đêm phải lớn hơn 0");
        }
        
        // Calculate total price: room price * number of guests * number of nights
        int totalGuests = (request.getAdultsCount() != null ? request.getAdultsCount() : 0) + 
                         (request.getChildrenCount() != null ? request.getChildrenCount() : 0);
        double totalPrice = room.getPrice() * totalGuests * nights;
        
        Bookings booking = Bookings.builder()
            .user(user)
            .room(room)
            .checkIn(request.getCheckIn())
            .checkOut(request.getCheckOut())
            .totalPrice(totalPrice)
            .status(BookingStatus.PENDING)
            .adultsCount(request.getAdultsCount())
            .childrenCount(request.getChildrenCount())
            .infantsCount(request.getInfantsCount())
            .build();
        
        booking = bookingRepository.save(booking);
        return BookingMapper.toDTO(booking);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUpcomingBookings(Integer userId) {
        LocalDate today = LocalDate.now();
        List<Bookings> bookings = bookingRepository.findUpcomingBookings(userId, today);
        return BookingMapper.toDTOList(bookings);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getPastBookings(Integer userId) {
        // Return all CONFIRMED bookings (regardless of checkOut date)
        List<Bookings> bookings = bookingRepository.findConfirmedBookings(userId);
        return BookingMapper.toDTOList(bookings);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        return BookingMapper.toDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        
        User currentUser = userService.getCurrentUser();
        if (!booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền hủy booking này");
        }
        
        booking.setStatus(BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);
        return BookingMapper.toDTO(booking);
    }
    
    @Override
    @Transactional
    public BookingResponseDTO confirmBooking(Integer bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy booking với ID: " + bookingId));
        
        User currentUser = userService.getCurrentUser();
        if (!booking.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận booking này");
        }
        
        booking.setStatus(BookingStatus.CONFIRMED);
        booking = bookingRepository.save(booking);
        return BookingMapper.toDTO(booking);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(Integer userId) {
        List<Bookings> bookings = bookingRepository.findByUser_UserId(userId);
        return BookingMapper.toDTOList(bookings);
    }
}

