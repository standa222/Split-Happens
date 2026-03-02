import { Stack } from "@mui/material";
import {OverallBalance} from "../../components/OverallBalance";
import {HomePageContent} from "./HomePageContent";

export function HomePage() {
    return (
        <Stack
            width="100%"
        >
            <OverallBalance />
            <HomePageContent />
            <h1>Home Page</h1>
            <p>Welcome to the home page!</p>
        </Stack>
    );
}