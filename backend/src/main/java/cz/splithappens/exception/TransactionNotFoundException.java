package cz.splithappens.exception;

public class TransactionNotFoundException extends NotFoundException {
    public TransactionNotFoundException(Long transactionId) {
        super("TRANSACTION_NOT_FOUND", "Transaction not found" + (transactionId != null ? ": " + transactionId : ""));
    }
}

