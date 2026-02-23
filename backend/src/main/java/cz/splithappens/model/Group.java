package cz.splithappens.model;

import cz.splithappens.model.enums.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "\"group\"")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;
    private String defaultCurrency = "CZK";

    @Enumerated(EnumType.STRING)
    private PermissionMode permissionMode = PermissionMode.SOFT;

    @Enumerated(EnumType.STRING)
    private GroupType groupType = GroupType.GROUP;

    @ManyToMany
    @JoinTable(
            name = "group_member",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();
}
