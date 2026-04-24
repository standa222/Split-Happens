import type { ReactElement } from "react";
import HomeIcon from "@mui/icons-material/Home";
import BoltIcon from "@mui/icons-material/Bolt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MovieIcon from "@mui/icons-material/Movie";
import FlightIcon from "@mui/icons-material/Flight";
import PaletteIcon from "@mui/icons-material/Palette";
import PetsIcon from "@mui/icons-material/Pets";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import {TTransaction} from "../types/TTransaction";
import logo from "../assets/logo_dark.png";

export type Category = {
    name: string;
    icon: ReactElement;
    intlId: string;
}

export const categories: Category[] = [
    { name: "HOUSING", icon: <HomeIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.housing" },
    { name: "UTILITIES", icon: <BoltIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.utilities" },
    { name: "GROCERIES", icon: <ShoppingCartIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.groceries" },
    { name: "DINING", icon: <RestaurantIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.dining" },
    { name: "COFFEE", icon: <LocalCafeIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.coffee" },
    { name: "ALCOHOL", icon: <LocalBarIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.alcohol" },
    { name: "FUEL", icon: <LocalGasStationIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.fuel" },
    { name: "TRANSIT", icon: <DirectionsBusIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.transit" },
    { name: "SPORTS", icon: <FitnessCenterIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.sports" },
    { name: "PHARMACY", icon: <LocalPharmacyIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.pharmacy" },
    { name: "ELECTRONICS", icon: <SmartphoneIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.electronics" },
    { name: "HOUSEHOLD", icon: <CleaningServicesIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.household" },
    { name: "SUBSCRIPTIONS", icon: <CreditCardIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.subscriptions" },
    { name: "ENTERTAINMENT", icon: <MovieIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.entertainment" },
    { name: "TRAVEL", icon: <FlightIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.travel" },
    { name: "HOBBIES", icon: <PaletteIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.hobbies" },
    { name: "PETS", icon: <PetsIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.pets" },
    { name: "GIFTS", icon: <CardGiftcardIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.gifts" },
    { name: "OTHER", icon: <HelpOutlineIcon sx={{fontSize: {xs: 30, md: 40}}}/>, intlId: "category.other" },
];

export function getCategoryIcon(transaction: TTransaction) {
    const category = transaction.expenseCategory ? categories.find(c => c.name === transaction.expenseCategory) : null;

    return category ? (
        category.icon
    ) : (
        <img src={logo} alt="Logo" style={{height: "100%", width: "100%"}}/>
    )
}

export function getCategoryIntlId(categoryName: string) {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.intlId : "category.other";
}
