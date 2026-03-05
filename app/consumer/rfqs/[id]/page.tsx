import type { Metadata } from "next";
import ConsumerRFQDetailsPage from "@/templates/ConsumerRFQDetailsPage";

export const metadata: Metadata = {
    title: "Quote Detail | RFQ Hub",
};

const ConsumerRFQDetail = () => {
    return <ConsumerRFQDetailsPage />;
};

export default ConsumerRFQDetail;
