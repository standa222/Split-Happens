package cz.splithappens.controller;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for managing users, including registration.")
public class UserController {
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Register a new user", description = "Registers a new user with the provided email and password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<UserDto> createUser(@RequestBody UserCreateDto createDto) {
        return ResponseEntity.ok(userService.createUser(createDto));
    }
}
