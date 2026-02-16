package cz.splithappens.model;

import cz.splithappens.model.enums.*;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "\"group\"")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String defaultCurrency = "CZK";

    @Enumerated(EnumType.STRING)
    private PermissionMode mode = PermissionMode.SOFT;

    @Enumerated(EnumType.STRING)
    private GroupType type = GroupType.GROUP;

    @ManyToMany
    @JoinTable(
            name = "group_member",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();
}
