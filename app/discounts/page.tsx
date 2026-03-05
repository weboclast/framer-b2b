import type { Metadata } from "next";
import DiscountsPage from "@/templates/DiscountsPage";

export const metadata: Metadata = {
    title: "Discounts | RFQ Hub",
};

const Discounts = () => {
    return <DiscountsPage />;
};

export default Discounts;
