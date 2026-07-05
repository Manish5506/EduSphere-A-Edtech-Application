package com.edtech.controller;

import com.edtech.dto.DashboardStatsDTO;
import com.edtech.security.UserPrincipal;
import com.edtech.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        String role = userPrincipal.getAuthorities().isEmpty() ? "student" :
                userPrincipal.getAuthorities().iterator().next().getAuthority();
        
        DashboardStatsDTO stats = dashboardService.getDashboardStats(userPrincipal.getId(), role);
        return ResponseEntity.ok(stats);
    }
}
