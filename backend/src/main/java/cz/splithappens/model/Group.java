package cz.splithappens.model;

import cz.splithappens.model.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "\"group\"")
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private Currency defaultCurrency = Currency.CZK;

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
    @OrderBy("lastName ASC, firstName ASC, id ASC")
    private Set<User> members = new LinkedHashSet<>();

    @Column(name = "last_activity", nullable = false)
    private OffsetDateTime lastActivity = OffsetDateTime.now();

    @JdbcTypeCode(SqlTypes.VARBINARY)
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "group_image")
    private byte[] groupImage;

    public void updateLastActivity() {
        this.lastActivity = OffsetDateTime.now();
    }

    public void removeMember(Long userId) {
        members.removeIf(user -> user.getId().equals(userId));
        updateLastActivity();
    }
}
