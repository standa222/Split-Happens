package cz.splithappens.repository;

import cz.splithappens.model.FriendLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<FriendLink, FriendLink.FriendLinkId> {

    List<FriendLink> findAllByIdUserId(Long userId);

    Optional<FriendLink> findByIdUserIdAndIdFriendId(Long userId, Long friendId);

    boolean existsByIdUserIdAndIdFriendId(Long userId, Long friendId);

    void deleteByIdUserIdAndIdFriendId(Long userId, Long friendId);
}


