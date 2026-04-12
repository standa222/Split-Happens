package cz.splithappens.exception;

public class DebtNotFoundException extends NotFoundException {
    public DebtNotFoundException(Long debtId) {
        super("DEBT_NOT_FOUND", "Debt not found" + (debtId != null ? ": " + debtId : ""));
    }
}

