package com.anganwadi.anganwadi_management;

import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AnganwadiManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnganwadiManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner createAdmin(WorkerRepository workerRepo, PasswordEncoder encoder) {
		return args -> {
			if (workerRepo.findByMobile("9999999999").isEmpty()) {
				Worker admin = Worker.builder()
						.employeeId("ADMIN001")
						.fullName("System Admin")
						.mobile("9999999999")
						.role(Worker.Role.ADMIN)
						.hashedPassword(encoder.encode("admin123"))
						.active(true)
						.build();
				workerRepo.save(admin);
				System.out.println("✅ Admin created - mobile: 9999999999, password: admin123");
			}
		};
	}


}

