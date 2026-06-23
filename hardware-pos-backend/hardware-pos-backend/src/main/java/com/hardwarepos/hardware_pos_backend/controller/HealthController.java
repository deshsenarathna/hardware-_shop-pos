package com.hardwarepos.hardware_pos_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;


@RestController
@RequestMapping("api/health")
public class HealthController {

   @GetMapping
    public Map<String, String> checkHealth(){
       return Map.of(
               "status", "UP",
               "message", "Hardware Shop POS backend is running"
       );
   }
}
