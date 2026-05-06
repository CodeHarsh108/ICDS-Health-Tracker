package com.anganwadi.anganwadi_management;

import com.anganwadi.anganwadi_management.entity.VaccinationSchedule;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.VaccinationScheduleRepository;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class AnganwadiManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnganwadiManagementApplication.class, args);
	}

	@Bean
	public CommandLineRunner createAdmin(WorkerRepository workerRepo, PasswordEncoder encoder) {
		return args -> {
			if (workerRepo.findByMobile("9589850604").isEmpty()) {
				Worker admin = Worker.builder()
						.employeeId("ADMIN001")
						.fullName("System Admin")
						.mobile("9589850604")
						.role(Worker.Role.ADMIN)
						.hashedPassword(encoder.encode("admin123"))
						.active(true)
						.build();
				workerRepo.save(admin);
				System.out.println("✅ Admin created - mobile: 9589850604, password: admin123");
			}
		};
	}


	@Bean
	public CommandLineRunner preloadVaccines(VaccinationScheduleRepository vaccineRepo) {
		return args -> {
			if (vaccineRepo.count() == 0) {
				List<VaccinationSchedule> vaccines = List.of(
						VaccinationSchedule.builder().vaccineName("BCG").dueAgeDays(0).description("At birth").build(),
						VaccinationSchedule.builder().vaccineName("OPV-0").dueAgeDays(0).description("At birth").build(),
						VaccinationSchedule.builder().vaccineName("Hep-B-0").dueAgeDays(0).description("At birth").build(),
						VaccinationSchedule.builder().vaccineName("DPT-1").dueAgeDays(42).description("6 weeks").build(),
						VaccinationSchedule.builder().vaccineName("OPV-1").dueAgeDays(42).description("6 weeks").build(),
						VaccinationSchedule.builder().vaccineName("Hib-1").dueAgeDays(42).description("6 weeks").build(),
						VaccinationSchedule.builder().vaccineName("Hep-B-1").dueAgeDays(42).description("6 weeks").build(),
						VaccinationSchedule.builder().vaccineName("DPT-2").dueAgeDays(70).description("10 weeks").build(),
						VaccinationSchedule.builder().vaccineName("OPV-2").dueAgeDays(70).description("10 weeks").build(),
						VaccinationSchedule.builder().vaccineName("Hib-2").dueAgeDays(70).description("10 weeks").build(),
						VaccinationSchedule.builder().vaccineName("DPT-3").dueAgeDays(98).description("14 weeks").build(),
						VaccinationSchedule.builder().vaccineName("OPV-3").dueAgeDays(98).description("14 weeks").build(),
						VaccinationSchedule.builder().vaccineName("Hib-3").dueAgeDays(98).description("14 weeks").build(),
						VaccinationSchedule.builder().vaccineName("IPV").dueAgeDays(98).description("14 weeks").build(),
						VaccinationSchedule.builder().vaccineName("Measles-1").dueAgeDays(274).description("9 months").build(),
						VaccinationSchedule.builder().vaccineName("MR-1").dueAgeDays(274).description("9 months").build(),
						VaccinationSchedule.builder().vaccineName("DPT-Booster").dueAgeDays(487).description("16-24 months").build(),
						VaccinationSchedule.builder().vaccineName("OPV-Booster").dueAgeDays(487).description("16-24 months").build(),
						VaccinationSchedule.builder().vaccineName("Measles-2").dueAgeDays(487).description("16-24 months").build()
				);
				vaccineRepo.saveAll(vaccines);
				System.out.println("✅ Preloaded " + vaccines.size() + " vaccines");
			}
		};
	}

}

