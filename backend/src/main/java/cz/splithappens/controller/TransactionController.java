package cz.splithappens.controller;

import cz.splithappens.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Endpoints for managing transactions within groups")
public class TransactionController {
    private final TransactionService transactionService;

    @GetMapping("/{transactionId}")
    @Operation(summary = "Get transaction details", description = "Returns details of a specific transaction, including the amount, description, date, and involved members.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group associated with the transaction"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public void getTransactionDetails() {
        // TODO implement
    }
}
