package com.anganwadi.anganwadi_management.security;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final WorkerRepository workerRepository;

    public CustomUserDetailsService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String mobile) throws UsernameNotFoundException {
        Worker worker = (Worker) workerRepository.findByMobile(mobile)
                .orElseThrow(() -> new UsernameNotFoundException("Worker not found with mobile: " + mobile));

        if (!worker.isActive()) {
            throw new UsernameNotFoundException("Worker account is disabled");
        }

        // Convert Worker role to Spring Security authority (ROLE_ prefix)
        String role = "ROLE_" + worker.getRole().name();  // e.g., ROLE_ADMIN
        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(role));

        return new User(worker.getMobile(), worker.getHashedPassword(), authorities);
    }
}