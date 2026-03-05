"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

type StoreData = {
    id: string;
    name: string;
    businessLocation: string | null;
    currency: string;
    taxPercent: number;
};

const StoreSettings = () => {
    const [store, setStore] = useState<StoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        businessLocation: "",
        currency: "USD",
        taxPercent: "0",
    });

    useEffect(() => {
        fetch("/api/settings/store")
            .then((r) => r.json())
            .then((data) => {
                setStore(data);
                setFormData({
                    name: data.name || "",
                    businessLocation: data.businessLocation || "",
                    currency: data.currency || "USD",
                    taxPercent: String(data.taxPercent ?? 0),
                });
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            const res = await fetch("/api/settings/store", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    businessLocation: formData.businessLocation || null,
                    currency: formData.currency,
                    taxPercent: parseFloat(formData.taxPercent) || 0,
                }),
            });
            if (!res.ok) throw new Error("Save failed");
            const updated = await res.json();
            setStore(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const copyStoreId = () => {
        if (store?.id) {
            navigator.clipboard.writeText(store.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <Card title="Store Settings">
                <div className="p-5 pt-0 animate-pulse space-y-4">
                    <div className="h-12 bg-b-surface2 rounded-xl" />
                    <div className="h-12 bg-b-surface2 rounded-xl" />
                </div>
            </Card>
        );
    }

    return (
        <Card title="Store Settings">
            <div className="flex flex-col gap-6 p-5 pt-0 max-lg:px-3">
                {/* Store ID */}
                <div>
                    <label className="block text-body-2 font-medium text-t-secondary mb-2">
                        Store ID
                        <span className="ml-2 text-caption text-t-tertiary font-normal">(read-only — use in Framer)</span>
                    </label>
                    <div className="flex gap-3">
                        <div className="flex-1 bg-b-surface2 rounded-xl px-4 py-3 font-mono text-body-2 text-t-secondary truncate">
                            {store?.id || "—"}
                        </div>
                        <Button icon={copied ? "check" : "copy"} isWhite onClick={copyStoreId}>
                            {copied ? "Copied!" : "Copy"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                    <Field
                        label="Store Name"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="My B2B Store"
                    />
                    <Field
                        label="Currency (ISO code)"
                        value={formData.currency}
                        onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
                        placeholder="USD"
                    />
                </div>

                <Field
                    label="Business Location"
                    value={formData.businessLocation}
                    onChange={(e) => setFormData((p) => ({ ...p, businessLocation: e.target.value }))}
                    placeholder="City, Country"
                />

                <div className="max-w-xs">
                    <Field
                        label="Tax Percentage (%)"
                        type="number"
                        value={formData.taxPercent}
                        onChange={(e) => setFormData((p) => ({ ...p, taxPercent: e.target.value }))}
                        placeholder="0"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Button isBlack onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                    {success && (
                        <div className="flex items-center gap-2 text-green-500 text-body-2">
                            <Icon name="check" className="fill-green-500 w-4 h-4" />
                            Saved successfully
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default StoreSettings;
