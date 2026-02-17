package cz.splithappens.dto.request;

import lombok.Getter;

@Getter
public class UserCreateDto {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
