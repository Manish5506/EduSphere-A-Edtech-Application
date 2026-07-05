package com.edtech.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Service
public class RazorpayService {

    private RazorpayClient razorpayClient;

    @Value("${app.razorpay.key-id:}")
    private String keyId;

    @Value("${app.razorpay.key-secret:}")
    private String keySecret;

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(keyId) && !keyId.equalsIgnoreCase("placeholder") && !keyId.isEmpty()) {
            try {
                this.razorpayClient = new RazorpayClient(keyId, keySecret);
            } catch (RazorpayException e) {
                System.err.println("Could not initialize Razorpay Client: " + e.getMessage());
            }
        }
    }

    public String createOrder(double amount, String currency) throws RazorpayException {
        if (this.razorpayClient != null) {
            JSONObject orderRequest = new JSONObject();
            // Razorpay accepts amount in paise (1 INR = 100 paise)
            orderRequest.put("amount", (int) (amount * 100));
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "txn_" + UUID.randomUUID().toString().substring(0, 8));
            
            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
            return order.get("id");
        } else {
            // Mock Order Mode
            return "order_mock_" + UUID.randomUUID().toString().substring(0, 12);
        }
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (this.razorpayClient != null) {
            try {
                String payload = orderId + "|" + paymentId;
                return Utils.verifySignature(payload, signature, keySecret);
            } catch (Exception e) {
                return false;
            }
        } else {
            // Mock Verification Mode
            return true; // Always authorize mocks for local testing
        }
    }
}
