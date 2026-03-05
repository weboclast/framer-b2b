import type { Metadata } from "next";
import AdminStoresPage from "@/templates/AdminStoresPage";

export const metadata: Metadata = {
    title: "Admin Stores | RFQ Hub",
};

const AdminStores = () => {
    return <AdminStoresPage />;
};

export default AdminStores;
