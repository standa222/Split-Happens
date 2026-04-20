package cz.splithappens.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "friend")
public class FriendLink {

    @EmbeddedId
    private FriendLinkId id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendLinkId implements java.io.Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "friend_id")
        private Long friendId;

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            FriendLinkId that = (FriendLinkId) o;
            return java.util.Objects.equals(userId, that.userId)
                    && java.util.Objects.equals(friendId, that.friendId);
        }

        @Override
        public int hashCode() {
            return java.util.Objects.hash(userId, friendId);
        }
    }
}


