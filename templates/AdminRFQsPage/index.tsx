"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Search from "@/components/Search";
import Select from "@/components/Select";
import Icon from "@/components/Icon";

const PAGE_SIZE = 50;

const statusOptions = [
    { id: 0, name: "All Status", slug: "all" },
    { id: 1, name: "Pending", slug: "PENDING" },
    { id: 2, name: "Quoted", slug: "QUOTED" },
    { id: 3, name: "Accepted", slug: "ACCEPTED" },
    { id: 4, name: "Closed", slug: "CLOSED" },
];

const AdminRFQsPage = () => {
    const router = useRouter();
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(statusOptions[0]);

    const fetchRfqs = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter.slug !== "all") params.append("status", statusFilter.slug);
            if (search) params.append("query", search);
            params.append("skip", String(skip));
            params.append("take", String(PAGE_SIZE));

            const res = await fetch(`/api/admin/rfqs?${params.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setRfqs(data.rfqs);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(fetchRfqs, 300);
        return () => clearTimeout(timer);
    }, [skip, search, statusFilter]);

    return (
        <Layout title="Admin – All RFQs">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4 max-md:block">
                    <div className="flex items-center gap-3">
                        <Select
                            classButton="bg-b-surface2 w-40"
                            value={statusFilter}
                            onChange={(val: any) => setStatusFilter(val)}
                            options={statusOptions}
                        />
                    </div>
                    <Search
                        className="w-72"
                        placeholder="Search all RFQs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Card title={`All Platform RFQs (${total} total)`} className={`overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <Table
                        cellsThead={
                            <>
                                <th>RFQ ID</th>
                                <th>Store</th>
                                <th>Customer</th>
                                <th className="text-right">Total</th>
                                <th>Status</th>
                                <th>Created</th>
                            </>
                        }
                    >
                        {rfqs.map((rfq) => (
                            <tr key={rfq.id} className="border-b border-s-subtle last:border-0 hover:bg-b-surface2 cursor-pointer" onClick={() => router.push(`/rfqs/${rfq.id}`)}>
                                <td className="font-mono text-body-2">{rfq.id.slice(0, 8)}...</td>
                                <td>
                                    <div className="text-body-2 font-medium">{rfq.store.name}</div>
                                    <div className="text-caption text-t-tertiary">{rfq.store.id}</div>
                                </td>
                                <td>
                                    <div className="text-body-2">{rfq.customerName}</div>
                                    <div className="text-caption text-t-tertiary">{rfq.customerEmail}</div>
                                </td>
                                <td className="text-right text-body-1 font-medium">${rfq.total.toFixed(2)}</td>
                                <td>
                                    <span className="text-caption px-2 py-1 rounded-full bg-b-surface2">{rfq.status}</span>
                                </td>
                                <td className="text-body-2 text-t-tertiary">
                                    {new Date(rfq.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                {total > PAGE_SIZE && (
                    <div className="flex gap-2 justify-end">
                        <Button isStroke isGray disabled={skip === 0} onClick={() => setSkip(skip - PAGE_SIZE)}>Previous</Button>
                        <Button isStroke isGray disabled={skip + PAGE_SIZE >= total} onClick={() => setSkip(skip + PAGE_SIZE)}>Next</Button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AdminRFQsPage;
