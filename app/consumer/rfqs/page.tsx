import type { Metadata } from "next";
import ConsumerRFQsPage from "@/templates/ConsumerRFQsPage";

export const metadata: Metadata = {
    title: "My Quotes | RFQ Hub",
};

const ConsumerRFQs = () => {
    return <ConsumerRFQsPage />;
};

export default ConsumerRFQs;
