"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Search from "@/components/Search";

type StoreRow = {
    id: string;
    name: string;
    active: boolean;
    currency: string;
    createdAt: string;
    owner: { id: string; name: string | null; email: string; createdAt: string };
    _count: { rfqs: number };
};

const AdminStoresPage = () => {
    const [stores, setStores] = useState<StoreRow[]>([]);
    const [filtered, setFiltered] = useState<StoreRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchStores = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/stores");
            if (!res.ok) throw new Error("Forbidden or error");
            const data = await res.json();
            setStores(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchStores(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(stores.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.owner.email.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        ));
    }, [search, stores]);

    const toggleActive = async (store: StoreRow) => {
        try {
            const res = await fetch(`/api/admin/stores/${store.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !store.active }),
            });
            if (!res.ok) throw new Error("Failed");
            await fetchStores();
        } catch {
            alert("Failed to update store status");
        }
    };

    return (
        <Layout title="Admin – Stores">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h4 mb-1">All Vendor Stores</h1>
                        <p className="text-body-2 text-t-tertiary">{stores.length} stores registered</p>
                    </div>
                    <Search
                        className="w-72"
                        placeholder="Search stores or owners..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card className={`overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <Table
                        cellsThead={
                            <>
                                <th>Store</th>
                                <th>Store ID</th>
                                <th>Owner</th>
                                <th className="w-20 text-right">RFQs</th>
                                <th className="w-24">Status</th>
                                <th className="w-32">Actions</th>
                            </>
                        }
                    >
                        {filtered.map((store) => (
                            <tr key={store.id} className="border-b border-s-subtle last:border-0">
                                <td>
                                    <div className="text-body-1 font-medium">{store.name}</div>
                                    <div className="text-caption text-t-tertiary">{store.currency}</div>
                                </td>
                                <td className="font-mono text-body-2 text-t-secondary">{store.id}</td>
                                <td>
                                    <div className="text-body-2">{store.owner.name || "—"}</div>
                                    <div className="text-caption text-t-tertiary">{store.owner.email}</div>
                                </td>
                                <td className="text-right text-body-1 font-medium">{store._count.rfqs}</td>
                                <td>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium ${store.active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                        {store.active ? "Active" : "Suspended"}
                                    </span>
                                </td>
                                <td>
                                    <Button
                                        isSmall
                                        isWhite={store.active}
                                        isStroke={!store.active}
                                        onClick={() => toggleActive(store)}
                                    >
                                        {store.active ? "Suspend" : "Activate"}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                <div className="flex justify-center">
                    <Link href="/admin/rfqs">
                        <Button isWhite>View All RFQs →</Button>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default AdminStoresPage;
