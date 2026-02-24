import {Outlet} from "react-router-dom";
import {Navigation} from "./Navigation";

export function AppLayout() {
    return (
        <div className="flex flex-col items-center h-full">
            <Navigation />
            <main className="h-full max-w-[1440px] w-full">
                <Outlet />
            </main>
        </div>
    );
}