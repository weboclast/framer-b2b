"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Field from "@/components/Field";

type Discount = {
    id: string;
    code: string;
    type: "PERCENT" | "FIXED";
    value: number;
    minSubtotal: number;
    active: boolean;
    createdAt: string;
};

type FormData = {
    code: string;
    type: "PERCENT" | "FIXED";
    value: string;
    minSubtotal: string;
    active: boolean;
};

const defaultForm: FormData = { code: "", type: "PERCENT", value: "10", minSubtotal: "0", active: true };


const DiscountsPage = () => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
    const [formData, setFormData] = useState(defaultForm);

    const fetchDiscounts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/discounts");
            if (!res.ok) throw new Error("Failed to load discounts");
            setDiscounts(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDiscounts(); }, []);

    const openAddModal = () => {
        setEditingDiscount(null);
        setFormData(defaultForm);
        setModalOpen(true);
    };

    const openEditModal = (d: Discount) => {
        setEditingDiscount(d);
        setFormData({ code: d.code, type: d.type, value: String(d.value), minSubtotal: String(d.minSubtotal), active: d.active });
        setModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: parseFloat(formData.value) || 0,
                minSubtotal: parseFloat(formData.minSubtotal) || 0,
                active: formData.active,
            };

            const url = editingDiscount ? `/api/discounts/${editingDiscount.id}` : "/api/discounts";
            const method = editingDiscount ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }

            await fetchDiscounts();
            setModalOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this discount code?")) return;
        try {
            const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            await fetchDiscounts();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Unknown error");
        }
    };

    const toggleActive = async (d: Discount) => {
        try {
            await fetch(`/api/discounts/${d.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ active: !d.active }),
            });
            await fetchDiscounts();
        } catch (err) {
            alert("Failed to update");
        }
    };

    return (
        <Layout title="Discounts">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h4 mb-1">Discount Codes</h1>
                        <p className="text-body-2 text-t-tertiary">
                            Manage discount codes for your Framer storefront
                        </p>
                    </div>
                    <Button isBlack onClick={openAddModal}>Add Code</Button>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-2">{error}</div>
                )}

                <Card className={`overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
                    <Table
                        cellsThead={
                            <>
                                <th>Code</th>
                                <th className="w-24">Type</th>
                                <th className="w-24 text-right">Value</th>
                                <th className="w-32 text-right">Min Subtotal</th>
                                <th className="w-24">Status</th>
                                <th className="w-24">Actions</th>
                            </>
                        }
                    >
                        {discounts.map((d) => (
                            <tr key={d.id} className="border-b border-s-subtle last:border-0">
                                <td className="font-mono text-body-1 font-medium">{d.code}</td>
                                <td>
                                    <span className="text-body-2 text-t-secondary">{d.type}</span>
                                </td>
                                <td className="text-right text-body-1">
                                    {d.type === "PERCENT" ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                                </td>
                                <td className="text-right text-body-2 text-t-secondary">
                                    {d.minSubtotal > 0 ? `$${d.minSubtotal.toFixed(2)}` : "—"}
                                </td>
                                <td>
                                    <button onClick={() => toggleActive(d)} className="cursor-pointer">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium ${d.active ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"}`}>
                                            {d.active ? "Active" : "Inactive"}
                                        </span>
                                    </button>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-b-surface2 rounded-lg transition-colors" onClick={() => openEditModal(d)}>
                                            <Icon name="edit" className="fill-t-secondary w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-b-surface2 rounded-lg transition-colors" onClick={() => handleDelete(d.id)}>
                                            <Icon name="trash" className="fill-t-secondary w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </Table>
                </Card>

                {discounts.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Icon name="discount" className="fill-t-tertiary w-16 h-16 mb-4" />
                        <h3 className="text-h6 mb-2">No discount codes</h3>
                        <p className="text-body-2 text-t-tertiary mb-4">Create codes to offer discounts to your buyers.</p>
                        <Button isBlack onClick={openAddModal}>Create First Code</Button>
                    </div>
                )}

                {/* Validation info */}
                <Card className="p-6">
                    <h3 className="text-body-1 font-medium mb-2">Framer Integration</h3>
                    <p className="text-body-2 text-t-tertiary mb-3">
                        Validate discount codes from your Framer site using the public endpoint:
                    </p>
                    <pre className="p-4 bg-b-surface2 rounded-xl text-caption font-mono overflow-x-auto border border-s-stroke2">
                        {`POST /api/discounts/validate
{
  "storeId": "your-store-id",
  "code": "SUMMER20",
  "cartSubtotal": 500
}
// Returns: { valid, discountAmount, type, value }`}
                    </pre>
                </Card>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-8 w-full max-w-md">
                    <h2 className="text-h5 mb-6">{editingDiscount ? "Edit Discount" : "Add Discount Code"}</h2>
                    <div className="space-y-4">
                        <Field
                            label="Code"
                            value={formData.code}
                            onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                            placeholder="SUMMER20"
                        />
                        <div>
                            <label className="block text-body-2 font-medium text-t-secondary mb-2">Type</label>
                            <div className="flex gap-3">
                                {(["PERCENT", "FIXED"] as const).map((t) => (
                                    <button
                                        key={t}
                                        className={`flex-1 py-3 rounded-xl text-body-2 font-medium border transition-colors ${formData.type === t ? "bg-b-highlight border-b-highlight" : "border-s-stroke2 bg-b-surface2"}`}
                                        onClick={() => setFormData((p) => ({ ...p, type: t }))}
                                    >
                                        {t === "PERCENT" ? "Percentage (%)" : "Fixed Amount ($)"}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Field
                            label={formData.type === "PERCENT" ? "Percentage (%)" : "Amount ($)"}
                            type="number"
                            value={formData.value}
                            onChange={(e) => setFormData((p) => ({ ...p, value: e.target.value }))}
                            placeholder={formData.type === "PERCENT" ? "10" : "50"}
                        />
                        <Field
                            label="Minimum Subtotal (optional)"
                            type="number"
                            value={formData.minSubtotal}
                            onChange={(e) => setFormData((p) => ({ ...p, minSubtotal: e.target.value }))}
                            placeholder="0"
                            tooltip="Minimum cart subtotal required to use this code"
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={(e) => setFormData((p) => ({ ...p, active: e.target.checked }))}
                                className="w-5 h-5 rounded border-s-subtle bg-b-surface2"
                            />
                            <span className="text-body-1">Active</span>
                        </label>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <Button isGray onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button isBlack onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : editingDiscount ? "Save Changes" : "Add Code"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

export default DiscountsPage;
