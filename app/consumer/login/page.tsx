import type { Metadata } from "next";
import ConsumerLoginPage from "@/templates/ConsumerLoginPage";

export const metadata: Metadata = {
    title: "Buyer Login | RFQ Hub",
};

const ConsumerLogin = () => {
    return <ConsumerLoginPage />;
};

export default ConsumerLogin;
