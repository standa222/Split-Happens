package cz.splithappens.model.enums;

public enum PermissionMode {
    SOFT, // All members can edit or delete all transactions
    HARD  // All members can edit or delete own transactions, creator and chosen members can edit or delete all transactions
}
