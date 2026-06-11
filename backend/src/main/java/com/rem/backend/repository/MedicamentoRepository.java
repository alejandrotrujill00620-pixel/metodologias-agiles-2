package com.rem.backend.repository;

import com.rem.backend.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    List<Medicamento> findByPersonaId(Long personaId);
}
