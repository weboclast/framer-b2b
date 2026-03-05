import type { Metadata } from "next";
import ConsumerRegisterPage from "@/templates/ConsumerRegisterPage";

export const metadata: Metadata = {
    title: "Buyer Register | RFQ Hub",
};

const ConsumerRegister = () => {
    return <ConsumerRegisterPage />;
};

export default ConsumerRegister;
