import type { Metadata } from "next";
import AdminRFQsPage from "@/templates/AdminRFQsPage";

export const metadata: Metadata = {
    title: "Admin RFQs | RFQ Hub",
};

const AdminRFQs = () => {
    return <AdminRFQsPage />;
};

export default AdminRFQs;
