package cz.splithappens.service;

import cz.splithappens.model.User;

public interface DebtService {
    void settleDebt(Long debtId, User settler);
}
