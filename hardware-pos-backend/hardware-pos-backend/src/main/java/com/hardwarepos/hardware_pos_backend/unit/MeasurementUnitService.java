package com.hardwarepos.hardware_pos_backend.unit;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MeasurementUnitService {

    private final MeasurementUnitRepository unitRepository;

    public MeasurementUnitService(
            MeasurementUnitRepository unitRepository
    ) {
        this.unitRepository = unitRepository;
    }

    public MeasurementUnitResponse createUnit(
            MeasurementUnitRequest request
    ) {
        String unitName = request.getName().trim();  //trim => remove unwanted spaces
        String unitSymbol = request.getSymbol().trim();

        if (unitRepository.existsByNameIgnoreCase(unitName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Unit name already exists"
            );
        }

        if (unitRepository.existsBySymbolIgnoreCase(unitSymbol)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Unit symbol already exists"
            );
        }

        MeasurementUnit unit = new MeasurementUnit(
                unitName,
                unitSymbol,
                request.isAllowDecimal()
        );

        MeasurementUnit savedUnit =
                unitRepository.save(unit);

        return convertToResponse(savedUnit);
    }

    public List<MeasurementUnitResponse> getAllUnits() {
        return unitRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private MeasurementUnitResponse convertToResponse(
            MeasurementUnit unit
    ) {
        return new MeasurementUnitResponse(
                unit.getId(),
                unit.getName(),
                unit.getSymbol(),
                unit.isAllowDecimal(),
                unit.isActive()
        );
    }
}