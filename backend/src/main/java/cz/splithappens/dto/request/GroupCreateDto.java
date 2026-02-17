package cz.splithappens.dto.request;

import cz.splithappens.model.enums.PermissionMode;

public class GroupCreateDto {
    private String name;
    private String defaultCurrency;
    private PermissionMode mode;
}
