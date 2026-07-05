package com.edtech.service;

import com.edtech.dto.AuthResponse;
import com.edtech.dto.LoginRequest;
import com.edtech.dto.RegisterRequest;
import com.edtech.entity.ERole;
import com.edtech.entity.Role;
import com.edtech.entity.User;
import com.edtech.exception.BadRequestException;
import com.edtech.repository.RoleRepository;
import com.edtech.repository.UserRepository;
import com.edtech.security.JwtTokenProvider;
import com.edtech.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                roles
        );
    }

    @Transactional
    public User registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email Address already in use!");
        }

        // Creating user's account
        User user = new User(
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()),
                signUpRequest.getFirstName(),
                signUpRequest.getLastName()
        );

        Set<Role> roles = new HashSet<>();
        String strRole = signUpRequest.getRole();

        // Seed roles if they don't exist
        seedRolesIfEmpty();

        if (strRole == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            switch (strRole.toLowerCase()) {
                case "admin":
                    Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(adminRole);
                    break;
                case "instructor":
                    Role instructorRole = roleRepository.findByName(ERole.ROLE_INSTRUCTOR)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(instructorRole);
                    break;
                default:
                    Role studentRole = roleRepository.findByName(ERole.ROLE_STUDENT)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(studentRole);
            }
        }

        user.setRoles(roles);
        return userRepository.save(user);
    }

    private void seedRolesIfEmpty() {
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(null, ERole.ROLE_STUDENT));
            roleRepository.save(new Role(null, ERole.ROLE_INSTRUCTOR));
            roleRepository.save(new Role(null, ERole.ROLE_ADMIN));
        }
    }
}
