"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Tabs from "@/components/Tabs";
import Field from "@/components/Field";
import Icon from "@/components/Icon";

type TabId = "store" | "email" | "templates";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("store");
  const [storeSettings, setStoreSettings] = useState({
    name: "My Framer Store",
    businessLocation: "San Francisco, CA",
    currency: "USD",
    taxPercent: 10,
  });
  const [emailSettings, setEmailSettings] = useState({
    senderAddress: "quotes@my store.com",
    replyTo: "support@mystore.com",
    internalRecipient: "orders@mystore.com",
  });
  const [templateSettings, setTemplateSettings] = useState({
    confirmationSubject: "RFQ Received - {{rfqId}}",
    confirmationBody: `Dear {{customerName}},

Thank you for your quote request! We've received your inquiry and will get back to you shortly.

Your RFQ ID: {{rfqId}}

Best regards,
{{storeName}}`,
    notificationSubject: "New RFQ - {{customerName}}",
    notificationBody: `A new RFQ has been submitted.

Customer: {{customerName}}
Email: {{customerEmail}}
Company: {{companyName}}
Total: \${{total}}

RFQ ID: {{rfqId}}`,
    quoteSubject: "Quote for RFQ - {{rfqId}}",
    quoteBody: `Dear {{customerName}},

Thank you for your interest. Please find your quote below:

Items:
{{items}}

Subtotal: \${{subtotal}}
Tax: \${{tax}}
Shipping: \${{shipping}}
Total: \${{total}}

{{customMessage}}

Best regards,
{{storeName}}`,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: 0, name: "Store" },
    { id: 1, name: "Email" },
    { id: 2, name: "Templates" },
  ];

  const tabMap: Record<number, TabId> = {
    0: "store",
    1: "email",
    2: "templates",
  };

  const reverseTabMap: Record<TabId, number> = {
    store: 0,
    email: 1,
    templates: 2,
  };

  const renderPreview = () => {
    switch (activeTab) {
      case "email":
        return (
          <div className="mt-6 p-4 bg-b-surface2 rounded-xl">
            <h4 className="text-body-1 font-medium mb-2">Preview</h4>
            <div className="text-body-2 text-t-tertiary">
              <p><strong>From:</strong> {emailSettings.senderAddress || "(not set)"}</p>
              <p><strong>Reply-To:</strong> {emailSettings.replyTo || "(not set)"}</p>
              <p><strong>Internal Recipient:</strong> {emailSettings.internalRecipient || "(not set)"}</p>
            </div>
          </div>
        );
      case "templates":
        return (
          <div className="mt-6 p-4 bg-b-surface2 rounded-xl">
            <h4 className="text-body-1 font-medium mb-2">
              {activeTab === "templates" ? "Template Variables" : "Email Preview"}
            </h4>
            <p className="text-body-2 text-t-tertiary mb-3">
              Available variables: {"{{customerName}}"}, {"{{customerEmail}}"}, {"{{companyName}}"}, {"{{phone}}"}, {"{{rfqId}}"}, {"{{subtotal}}"}, {"{{tax}}"}, {"{{shipping}}"}, {"{{total}}"}, {"{{storeName}}"}, {"{{customMessage}}"}, {"{{items}}"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Layout title="Settings">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-h4 mb-1">Settings</h1>
            <p className="text-body-2 text-t-tertiary">
              Manage your store and email configurations
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-green-500 text-body-2">
                <Icon name="check" className="fill-green-500 w-4 h-4" />
                Saved
              </span>
            )}
            <Button isBlack onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs
          items={tabs}
          value={tabs[reverseTabMap[activeTab]]}
          setValue={(item) => setActiveTab(tabMap[item.id as number])}
        />

        <div className="mt-6">
          {activeTab === "store" && (
            <Card title="Store Settings" className="p-6">
              <h2 className="text-h6 mb-6">Store Information</h2>
              <div className="space-y-4">
                <Field
                  label="Store Name"
                  value={storeSettings.name}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Field
                  label="Business Location"
                  value={storeSettings.businessLocation}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({ ...prev, businessLocation: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Currency"
                    value={storeSettings.currency}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, currency: e.target.value }))
                    }
                  />
                  <Field
                    label="Tax Percent (%)"
                    type="number"
                    value={storeSettings.taxPercent.toString()}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        taxPercent: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {activeTab === "email" && (
            <Card title="Email Configuration" className="p-6">
              <h2 className="text-h6 mb-6">Email Configuration</h2>
              <div className="space-y-4">
                <Field
                  label="Sender Address"
                  tooltip="Email address emails are sent from"
                  value={emailSettings.senderAddress}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({ ...prev, senderAddress: e.target.value }))
                  }
                  placeholder="quotes@yourstore.com"
                />
                <Field
                  label="Reply-To"
                  tooltip="Where replies will be sent"
                  value={emailSettings.replyTo}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({ ...prev, replyTo: e.target.value }))
                  }
                  placeholder="support@yourstore.com"
                />
                <Field
                  label="Internal Recipient"
                  tooltip="Email address for order notifications"
                  value={emailSettings.internalRecipient}
                  onChange={(e) =>
                    setEmailSettings((prev) => ({ ...prev, internalRecipient: e.target.value }))
                  }
                  placeholder="orders@yourstore.com"
                />
              </div>
              {renderPreview()}
            </Card>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <Card title="Confirmation Template" className="p-6">
                <h2 className="text-h6 mb-2">Confirmation Email</h2>
                <p className="text-body-2 text-t-tertiary mb-4">
                  Sent to customer when they submit an RFQ
                </p>
                <div className="space-y-4">
                  <Field
                    label="Subject"
                    value={templateSettings.confirmationSubject}
                    onChange={(e) =>
                      setTemplateSettings((prev) => ({
                        ...prev,
                        confirmationSubject: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <label className="text-body-2 font-medium mb-2 block">Body</label>
                    <textarea
                      className="w-full h-48 p-4 bg-b-surface2 rounded-xl text-body-1 resize-none focus:outline-none focus:ring-2 focus:ring-b-highlight"
                      value={templateSettings.confirmationBody}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          confirmationBody: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card title="Notification Template" className="p-6">
                <h2 className="text-h6 mb-2">Notification Email</h2>
                <p className="text-body-2 text-t-tertiary mb-4">
                  Sent to internal recipient when new RFQ is received
                </p>
                <div className="space-y-4">
                  <Field
                    label="Subject"
                    value={templateSettings.notificationSubject}
                    onChange={(e) =>
                      setTemplateSettings((prev) => ({
                        ...prev,
                        notificationSubject: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <label className="text-body-2 font-medium mb-2 block">Body</label>
                    <textarea
                      className="w-full h-48 p-4 bg-b-surface2 rounded-xl text-body-1 resize-none focus:outline-none focus:ring-2 focus:ring-b-highlight"
                      value={templateSettings.notificationBody}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          notificationBody: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </Card>

              <Card title="Quote Template" className="p-6">
                <h2 className="text-h6 mb-2">Quote Email</h2>
                <p className="text-body-2 text-t-tertiary mb-4">
                  Sent to customer when you send a quote
                </p>
                <div className="space-y-4">
                  <Field
                    label="Subject"
                    value={templateSettings.quoteSubject}
                    onChange={(e) =>
                      setTemplateSettings((prev) => ({
                        ...prev,
                        quoteSubject: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <label className="text-body-2 font-medium mb-2 block">Body</label>
                    <textarea
                      className="w-full h-48 p-4 bg-b-surface2 rounded-xl text-body-1 resize-none focus:outline-none focus:ring-2 focus:ring-b-highlight"
                      value={templateSettings.quoteBody}
                      onChange={(e) =>
                        setTemplateSettings((prev) => ({
                          ...prev,
                          quoteBody: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {renderPreview()}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
