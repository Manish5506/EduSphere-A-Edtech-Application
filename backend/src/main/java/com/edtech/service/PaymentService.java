package com.edtech.service;

import com.edtech.dto.OrderResponse;
import com.edtech.dto.PaymentRequest;
import com.edtech.entity.Course;
import com.edtech.entity.Order;
import com.edtech.entity.Payment;
import com.edtech.entity.User;
import com.edtech.exception.BadRequestException;
import com.edtech.exception.ResourceNotFoundException;
import com.edtech.repository.CartRepository;
import com.edtech.repository.CourseRepository;
import com.edtech.repository.OrderRepository;
import com.edtech.repository.PaymentRepository;
import com.edtech.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private EnrollmentService enrollmentService;

    @Transactional
    public OrderResponse createCheckoutOrder(Long studentId, List<Long> courseIds) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", studentId));

        if (courseIds == null || courseIds.isEmpty()) {
            throw new BadRequestException("No courses selected for purchase!");
        }

        List<Course> courses = new ArrayList<>();
        double totalAmount = 0.0;

        for (Long id : courseIds) {
            Course course = courseRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
            courses.add(course);
            totalAmount += course.getPrice();
        }

        Order order = new Order();
        order.setStudent(student);
        order.setAmount(totalAmount);
        order.setCourses(courses);
        order.setStatus("CREATED");
        order = orderRepository.save(order);

        try {
            String razorpayOrderId = razorpayService.createOrder(totalAmount, "INR");
            order.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(order);

            return new OrderResponse(razorpayOrderId, totalAmount, "INR", "CREATED");
        } catch (Exception e) {
            order.setStatus("FAILED");
            orderRepository.save(order);
            throw new BadRequestException("Failed to initiate order with Razorpay: " + e.getMessage());
        }
    }

    @Transactional
    public Order verifyAndCompletePayment(Long studentId, PaymentRequest request) {
        Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "razorpayOrderId", request.getRazorpayOrderId()));

        if (!order.getStudent().getId().equals(studentId)) {
            throw new BadRequestException("Order does not belong to this student!");
        }

        if (order.getStatus().equals("PAID")) {
            return order; // Already processed
        }

        boolean verified = razorpayService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!verified) {
            throw new BadRequestException("Payment signature verification failed!");
        }

        // Update Order
        order.setStatus("PAID");
        orderRepository.save(order);

        // Record Payment
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setAmount(order.getAmount());
        payment.setStatus("CAPTURED");
        paymentRepository.save(payment);

        // Enroll Student in all purchased courses
        for (Course course : order.getCourses()) {
            enrollmentService.enrollStudent(order.getStudent(), course);
        }

        // Clear active cart items for the student
        cartRepository.deleteByStudent(order.getStudent());

        return order;
    }
}
