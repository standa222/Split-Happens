package cz.splithappens.controller;

import cz.splithappens.service.DebtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debts")
@RequiredArgsConstructor
@Tag(name = "Debts", description = "Endpoints for managing debts between group members")
public class DebtController {
    private final DebtService debtService;

    @DeleteMapping("/{debtId}")
    @Operation(summary = "Settle a debt", description = "Deletes debt and creates payment transaction, indicating that the owed amount has been paid back.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Debt settled successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group associated with the debt"),
            @ApiResponse(responseCode = "404", description = "Debt not found")
    })
    public ResponseEntity<Void> settleDebt(@PathVariable Long debtId) {
        debtService.settleDebt(debtId);
        return ResponseEntity.noContent().build();
    }
}
