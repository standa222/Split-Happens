import {TUser} from "../../types/TUser";
import {TDebt} from "../../types/TDebt";

type Props = {
    members: TUser[];
    debts: TDebt[];
}

export const GroupMembers = () => {
    return (
        <div>
            Group Members
        </div>
    );
}