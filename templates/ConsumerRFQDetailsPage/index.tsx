"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Icon from "@/components/Icon";

const ConsumerRFQDetailsPage = () => {
    const { id } = useParams();
    const [rfq, setRfq] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRfq = async () => {
            try {
                // We'll reuse the consumer RFQ list endpoint or create a specific one if needed.
                // For now, let's assume the consumer can view their own RFQ via a similar logic.
                const res = await fetch(`/api/consumer/rfqs`);
                const data = await res.json();
                const found = data.rfqs.find((r: any) => r.id === id);
                setRfq(found);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRfq();
    }, [id]);

    if (isLoading) return <Layout title="Loading Quote..."><div className="p-10 text-center">Loading...</div></Layout>;
    if (!rfq) return <Layout title="Quote Not Found"><div className="p-10 text-center">Quote not found or access denied.</div></Layout>;

    return (
        <Layout title={`Quote ${rfq.id.slice(0, 8)}`}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-h4">Quote Details</h1>
                    <span className="px-3 py-1 rounded-full bg-b-surface2 text-caption font-medium uppercase">{rfq.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
                    <Card className="col-span-2 p-0 overflow-hidden">
                        <div className="p-6 border-b border-s-subtle">
                            <h3 className="text-body-1 font-medium">Items Requested</h3>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-b-surface2 text-caption text-t-tertiary uppercase">
                                <tr>
                                    <th className="p-4 font-medium">Product</th>
                                    <th className="p-4 font-medium text-right">Qty</th>
                                    <th className="p-4 font-medium text-right">Price</th>
                                    <th className="p-4 font-medium text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rfq.items.map((item: any) => (
                                    <tr key={item.id} className="border-b border-s-subtle last:border-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {item.imageUrl && <img src={item.imageUrl} className="w-10 h-10 object-cover rounded-lg" />}
                                                <div>
                                                    <div className="text-body-2 font-medium">{item.productName}</div>
                                                    <div className="text-caption text-t-tertiary">{item.productId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-body-2">{item.quantity}</td>
                                        <td className="p-4 text-right text-body-2">${item.unitPrice.toFixed(2)}</td>
                                        <td className="p-4 text-right text-body-2 font-medium">${item.lineTotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="p-6 bg-b-surface2 flex flex-col items-end gap-2">
                            <div className="flex justify-between w-48 text-body-2">
                                <span className="text-t-tertiary">Subtotal</span>
                                <span>${rfq.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-body-2">
                                <span className="text-t-tertiary">Tax</span>
                                <span>${rfq.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-body-2">
                                <span className="text-t-tertiary">Shipping</span>
                                <span>${rfq.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-48 text-h6 mt-2 pt-2 border-t border-s-subtle">
                                <span>Total</span>
                                <span>${rfq.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    <div className="flex flex-col gap-6">
                        <Card title="Vendor Info">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="text-caption text-t-tertiary uppercase mb-1">Store Name</div>
                                    <div className="text-body-1 font-medium">{rfq.store.name}</div>
                                </div>
                                <div className="p-4 bg-b-surface2 rounded-xl flex items-center gap-3">
                                    <Icon name="info" className="fill-t-tertiary w-5 h-5" />
                                    <p className="text-caption text-t-tertiary">Contact the vendor directly for any questions regarding this quote.</p>
                                </div>
                            </div>
                        </Card>
                        <Card title="Timeline">
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0" />
                                    <div>
                                        <div className="text-body-2 font-medium">Request Submitted</div>
                                        <div className="text-caption text-t-tertiary">{new Date(rfq.createdAt).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ConsumerRFQDetailsPage;
