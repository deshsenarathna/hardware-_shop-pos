package com.hardwarepos.hardware_pos_backend.unit;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
public class MeasurementUnitController {

    private final MeasurementUnitService unitService;

    public MeasurementUnitController(
            MeasurementUnitService unitService
    ) {
        this.unitService = unitService;
    }

    @PostMapping
    public ResponseEntity<MeasurementUnitResponse> createUnit(
            @Valid @RequestBody MeasurementUnitRequest request
    ) {
        MeasurementUnitResponse response =
                unitService.createUnit(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<MeasurementUnitResponse>> getAllUnits() {
        return ResponseEntity.ok(
                unitService.getAllUnits()
        );
    }
}