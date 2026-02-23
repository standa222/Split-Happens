package cz.splithappens.controller;

import cz.splithappens.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/{groupId}")
    @Operation(summary = "Create a new transaction", description = "Creates a new transaction within a group, specifying the amount, description, date, and involved members.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transaction created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group associated with the transaction"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public void createTransaction() {
        // TODO implement
    }

    @PutMapping("/{transactionId}")
    @Operation(summary = "Update a transaction", description = "Updates the details of an existing transaction, such as the amount, description, date, or involved members.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transaction updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group associated with the transaction"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public void updateTransaction() {
        // TODO implement
    }

    @DeleteMapping("/{transactionId}")
    @Operation(summary = "Delete a transaction", description = "Deletes an existing transaction from the group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Transaction deleted successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group associated with the transaction"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public void deleteTransaction() {
        // TODO implement
    }
}
