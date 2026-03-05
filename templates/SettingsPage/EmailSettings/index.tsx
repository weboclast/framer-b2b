"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";
import Field from "@/components/Field";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

type EmailSettingsData = {
    senderAddress: string | null;
    replyTo: string | null;
    internalRecipient: string | null;
    confirmationSubject: string | null;
    confirmationBody: string | null;
    notificationSubject: string | null;
    notificationBody: string | null;
    quoteSubject: string | null;
    quoteBody: string | null;
};

const defaultSettings: EmailSettingsData = {
    senderAddress: "",
    replyTo: "",
    internalRecipient: "",
    confirmationSubject: "We received your quote request – {{rfqId}}",
    confirmationBody:
        "Hello {{customerName}},\n\nThank you for your request. Your RFQ ID is {{rfqId}}.\n\nSubtotal: ${{subtotal}}\nTax: ${{tax}}\nShipping: ${{shipping}}\nTotal: ${{total}}\n\nBest regards,\n{{storeName}}",
    notificationSubject: "New RFQ Received – {{rfqId}}",
    notificationBody:
        "New quote request from {{customerName}} ({{customerEmail}}).\nCompany: {{companyName}}\nTotal: ${{total}}",
    quoteSubject: "Your quote from {{storeName}} – {{rfqId}}",
    quoteBody:
        "Hello {{customerName}},\n\nHere is your quote from {{storeName}}.\n\nTotal: ${{total}}\n\n{{customMessage}}\n\nBest regards,\n{{storeName}}",
};

const VARIABLES_HELP = "Available variables: {{storeName}}, {{rfqId}}, {{customerName}}, {{companyName}}, {{total}}, {{subtotal}}, {{tax}}, {{shipping}}, {{customMessage}}";

const EmailSettings = () => {
    const [form, setForm] = useState<EmailSettingsData>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<"sender" | "confirmation" | "notification" | "quote">("sender");

    useEffect(() => {
        fetch("/api/settings/email")
            .then((r) => r.json())
            .then((data) => {
                setForm({
                    senderAddress: data.senderAddress || "",
                    replyTo: data.replyTo || "",
                    internalRecipient: data.internalRecipient || "",
                    confirmationSubject: data.confirmationSubject || defaultSettings.confirmationSubject,
                    confirmationBody: data.confirmationBody || defaultSettings.confirmationBody,
                    notificationSubject: data.notificationSubject || defaultSettings.notificationSubject,
                    notificationBody: data.notificationBody || defaultSettings.notificationBody,
                    quoteSubject: data.quoteSubject || defaultSettings.quoteSubject,
                    quoteBody: data.quoteBody || defaultSettings.quoteBody,
                });
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        setSuccess(false);
        try {
            const res = await fetch("/api/settings/email", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Save failed");
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: "sender" as const, label: "Sender" },
        { id: "confirmation" as const, label: "Confirmation" },
        { id: "notification" as const, label: "Notification" },
        { id: "quote" as const, label: "Quote" },
    ];

    if (isLoading) {
        return (
            <Card title="Email & Templates">
                <div className="p-5 pt-0 animate-pulse space-y-4">
                    <div className="h-12 bg-b-surface2 rounded-xl" />
                    <div className="h-32 bg-b-surface2 rounded-xl" />
                </div>
            </Card>
        );
    }

    return (
        <Card title="Email & Templates">
            <div className="flex flex-col gap-6 p-5 pt-0 max-lg:px-3">
                {/* Tab pills */}
                <div className="flex gap-2 flex-wrap">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-body-2 font-medium transition-colors ${activeTab === tab.id
                                    ? "bg-b-highlight text-t-primary"
                                    : "bg-b-surface2 text-t-secondary hover:bg-b-surface3"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "sender" && (
                    <div className="flex flex-col gap-4">
                        <Field
                            label="From Address"
                            type="email"
                            value={form.senderAddress || ""}
                            onChange={(e) => setForm((p) => ({ ...p, senderAddress: e.target.value }))}
                            placeholder="rfq@yourdomain.com"
                            tooltip="The email address customers will see as the sender"
                        />
                        <Field
                            label="Reply-To Address"
                            type="email"
                            value={form.replyTo || ""}
                            onChange={(e) => setForm((p) => ({ ...p, replyTo: e.target.value }))}
                            placeholder="hello@yourdomain.com"
                        />
                        <Field
                            label="Internal Notification Recipient"
                            type="email"
                            value={form.internalRecipient || ""}
                            onChange={(e) => setForm((p) => ({ ...p, internalRecipient: e.target.value }))}
                            placeholder="team@yourdomain.com"
                            tooltip="Where new RFQ notifications are sent internally"
                        />
                    </div>
                )}

                {activeTab === "confirmation" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-caption text-t-tertiary">{VARIABLES_HELP}</p>
                        <Field
                            label="Subject"
                            value={form.confirmationSubject || ""}
                            onChange={(e) => setForm((p) => ({ ...p, confirmationSubject: e.target.value }))}
                        />
                        <div>
                            <label className="block text-body-2 font-medium text-t-secondary mb-2">Body</label>
                            <textarea
                                className="w-full min-h-48 p-4 bg-b-surface2 rounded-xl text-body-2 resize-y focus:outline-none focus:ring-2 focus:ring-b-highlight border border-s-stroke2 font-mono"
                                value={form.confirmationBody || ""}
                                onChange={(e) => setForm((p) => ({ ...p, confirmationBody: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "notification" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-caption text-t-tertiary">{VARIABLES_HELP}</p>
                        <Field
                            label="Subject"
                            value={form.notificationSubject || ""}
                            onChange={(e) => setForm((p) => ({ ...p, notificationSubject: e.target.value }))}
                        />
                        <div>
                            <label className="block text-body-2 font-medium text-t-secondary mb-2">Body</label>
                            <textarea
                                className="w-full min-h-48 p-4 bg-b-surface2 rounded-xl text-body-2 resize-y focus:outline-none focus:ring-2 focus:ring-b-highlight border border-s-stroke2 font-mono"
                                value={form.notificationBody || ""}
                                onChange={(e) => setForm((p) => ({ ...p, notificationBody: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "quote" && (
                    <div className="flex flex-col gap-4">
                        <p className="text-caption text-t-tertiary">{VARIABLES_HELP}</p>
                        <Field
                            label="Subject"
                            value={form.quoteSubject || ""}
                            onChange={(e) => setForm((p) => ({ ...p, quoteSubject: e.target.value }))}
                        />
                        <div>
                            <label className="block text-body-2 font-medium text-t-secondary mb-2">Body</label>
                            <textarea
                                className="w-full min-h-48 p-4 bg-b-surface2 rounded-xl text-body-2 resize-y focus:outline-none focus:ring-2 focus:ring-b-highlight border border-s-stroke2 font-mono"
                                value={form.quoteBody || ""}
                                onChange={(e) => setForm((p) => ({ ...p, quoteBody: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <Button isBlack onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Settings"}
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

export default EmailSettings;
