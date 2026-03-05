"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const PAGE_SIZE = 20;

const ConsumerRFQsPage = () => {
    const [rfqs, setRfqs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const fetchRfqs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/consumer/rfqs?skip=${skip}&take=${PAGE_SIZE}`);
            if (!res.ok) throw new Error("Unauthorized");
            const data = await res.json();
            setRfqs(data.rfqs);
            setTotal(data.total);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchRfqs(); }, [skip]);

    return (
        <Layout title="My Quotes">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-h4 mb-1">My Quote Requests</h1>
                    <p className="text-body-2 text-t-tertiary">
                        View history and status of quotes you've requested from vendors.
                    </p>
                </div>

                <Card title={`All Requests (${total})`} className={`overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <Table
                        cellsThead={
                            <>
                                <th>RFQ ID</th>
                                <th>Vendor/Store</th>
                                <th className="text-right">Total</th>
                                <th>Status</th>
                                <th>Date</th>
                            </>
                        }
                    >
                        {rfqs.map((rfq) => (
                            <tr key={rfq.id} className="border-b border-s-subtle last:border-0 hover:bg-b-surface2 cursor-pointer">
                                <td className="font-mono text-body-2">{rfq.id.slice(0, 8)}...</td>
                                <td className="text-body-2 font-medium">{rfq.store.name}</td>
                                <td className="text-right text-body-1 font-medium">${rfq.total.toFixed(2)}</td>
                                <td>
                                    <span className="text-caption px-2 py-1 rounded-full bg-b-surface2 font-medium">{rfq.status}</span>
                                </td>
                                <td className="text-body-2 text-t-tertiary">{new Date(rfq.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                {rfqs.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Icon name="envelope" className="fill-t-tertiary w-16 h-16 mb-4" />
                        <h3 className="text-h6 mb-2">No quotes yet</h3>
                        <p className="text-body-2 text-t-tertiary">Your quote requests will appear here once you submit them from a vendor store.</p>
                    </div>
                )}

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

export default ConsumerRFQsPage;
