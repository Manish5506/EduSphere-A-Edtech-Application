package com.edtech;

import com.edtech.entity.ERole;
import com.edtech.entity.Role;
import com.edtech.entity.User;
import com.edtech.repository.RoleRepository;
import com.edtech.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.HashSet;
import java.util.Set;

@SpringBootApplication
@EnableScheduling
public class EdtechApplication {

	public static void main(String[] args) {
		SpringApplication.run(EdtechApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDatabase(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Seed Roles
			for (ERole eRole : ERole.values()) {
				if (!roleRepository.findByName(eRole).isPresent()) {
					Role role = new Role();
					role.setName(eRole);
					roleRepository.save(role);
				}
			}

			// 2. Seed Admin User
			if (!userRepository.findByEmail("admin@edtech.com").isPresent()) {
				User admin = new User();
				admin.setEmail("admin@edtech.com");
				admin.setPassword(passwordEncoder.encode("password123"));
				admin.setFirstName("Alex");
				admin.setLastName("Admin");
				
				Set<Role> roles = new HashSet<>();
				roleRepository.findByName(ERole.ROLE_ADMIN).ifPresent(roles::add);
				admin.setRoles(roles);
				userRepository.save(admin);
			}

			// 3. Seed Instructor User
			if (!userRepository.findByEmail("instructor@edtech.com").isPresent()) {
				User instructor = new User();
				instructor.setEmail("instructor@edtech.com");
				instructor.setPassword(passwordEncoder.encode("password123"));
				instructor.setFirstName("John");
				instructor.setLastName("Instructor");
				
				Set<Role> roles = new HashSet<>();
				roleRepository.findByName(ERole.ROLE_INSTRUCTOR).ifPresent(roles::add);
				instructor.setRoles(roles);
				userRepository.save(instructor);
			}

			// 4. Seed Student User
			if (!userRepository.findByEmail("student@edtech.com").isPresent()) {
				User student = new User();
				student.setEmail("student@edtech.com");
				student.setPassword(passwordEncoder.encode("password123"));
				student.setFirstName("Jane");
				student.setLastName("Student");
				
				Set<Role> roles = new HashSet<>();
				roleRepository.findByName(ERole.ROLE_STUDENT).ifPresent(roles::add);
				student.setRoles(roles);
				userRepository.save(student);
			}
		};
	}
}
