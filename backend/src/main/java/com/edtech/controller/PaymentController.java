package com.edtech.controller;

import com.edtech.dto.OrderResponse;
import com.edtech.dto.PaymentRequest;
import com.edtech.entity.Order;
import com.edtech.security.UserPrincipal;
import com.edtech.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
@PreAuthorize("hasRole('STUDENT')")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody List<Long> courseIds) {
        OrderResponse response = paymentService.createCheckoutOrder(userPrincipal.getId(), courseIds);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Valid @RequestBody PaymentRequest request) {
        Order order = paymentService.verifyAndCompletePayment(userPrincipal.getId(), request);
        return ResponseEntity.ok("Payment verified successfully and enrolled in " + order.getCourses().size() + " courses.");
    }
}
