package cz.splithappens.repository;

import cz.splithappens.model.Group;
import cz.splithappens.model.enums.GroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> findByMembersIdAndGroupTypeOrderByLastActivityDesc(Long userId, GroupType groupType);
    List<Group> findByMembersId(Long userId);
}
