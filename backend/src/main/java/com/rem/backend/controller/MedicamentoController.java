package com.rem.backend.controller;

import com.rem.backend.model.Medicamento;
import com.rem.backend.model.Persona;
import com.rem.backend.repository.MedicamentoRepository;
import com.rem.backend.repository.PersonaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/medicamentos")
public class MedicamentoController {

    private final MedicamentoRepository medicamentoRepository;
    private final PersonaRepository personaRepository;

    public MedicamentoController(MedicamentoRepository medicamentoRepository, PersonaRepository personaRepository) {
        this.medicamentoRepository = medicamentoRepository;
        this.personaRepository = personaRepository;
    }

    @GetMapping("/{personaId}")
    public ResponseEntity<List<Medicamento>> listarPorPersona(@PathVariable Long personaId) {
        if (!personaRepository.existsById(personaId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(medicamentoRepository.findByPersonaId(personaId));
    }

    @PostMapping("/{personaId}")
    public ResponseEntity<Medicamento> agregar(@PathVariable Long personaId, @RequestBody Medicamento medicamento) {
        return personaRepository.findById(personaId)
                .map(persona -> {
                    medicamento.setPersona(persona);
                    Medicamento guardado = medicamentoRepository.save(medicamento);
                    return ResponseEntity.ok(guardado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{personaId}/{medicamentoId}/tomar")
    public ResponseEntity<Medicamento> marcarTomado(@PathVariable Long personaId, @PathVariable Long medicamentoId) {
        if (!personaRepository.existsById(personaId)) {
            return ResponseEntity.notFound().build();
        }
        return medicamentoRepository.findById(medicamentoId)
                .map(med -> {
                    med.setTomado(true);
                    medicamentoRepository.save(med);
                    return ResponseEntity.ok(med);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{personaId}/{medicamentoId}")
    public ResponseEntity<Void> eliminarMedicamento(@PathVariable Long personaId, @PathVariable Long medicamentoId) {
        if (!personaRepository.existsById(personaId)) {
            return ResponseEntity.notFound().build();
        }
        return medicamentoRepository.findById(medicamentoId)
                .map(med -> {
                    medicamentoRepository.delete(med);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
