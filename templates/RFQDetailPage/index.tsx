"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import type { RFQStatus, RFQWithItems } from "@/types/rfq";

const statusColors: Record<RFQStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500",
  QUOTED: "bg-blue-500/20 text-blue-500",
  ACCEPTED: "bg-green-500/20 text-green-500",
  CLOSED: "bg-gray-500/20 text-gray-500",
};

const RFQDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [rfq, setRfq] = useState<RFQWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRawJson, setShowRawJson] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isSendingQuote, setIsSendingQuote] = useState(false);

  useEffect(() => {
    const fetchRfq = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/rfq/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFQ details");
        }
        const data = await response.json();
        setRfq(data);

        // Prepare default message
        setQuoteMessage(`Dear ${data.customerName},

Thank you for your interest in our products. Please find your quote below:

Subtotal: $${data.subtotal.toFixed(2)}
Tax: $${data.tax.toFixed(2)}
Shipping: $${data.shipping.toFixed(2)}
Total: $${data.total.toFixed(2)}

Please let us know if you have any questions.

Best regards`);
      } catch (err) {
        console.error("Error fetching RFQ:", err);
        setError("Could not load RFQ details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRfq();
  }, [id]);

  const handleSendQuote = async () => {
    if (!rfq) return;
    setIsSendingQuote(true);
    try {
      const response = await fetch(`/api/rfq/${id}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageBody: quoteMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send quote");
      }

      // Refresh data to show new status and history
      const updatedRfq = await fetch(`/api/rfq/${id}`).then(res => res.json());
      setRfq(updatedRfq);
      setShowQuoteModal(false);
    } catch (err) {
      console.error("Error sending quote:", err);
      alert("Failed to send quote. Please try again.");
    } finally {
      setIsSendingQuote(false);
    }
  };

  const handleUpdateStatus = async (newStatus: RFQStatus) => {
    if (!rfq) return;
    try {
      const response = await fetch(`/api/rfq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedData = await response.json();
      setRfq(updatedData);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    }
  };

  if (isLoading) {
    return (
      <Layout title="Loading RFQ...">
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-b-highlight"></div>
        </div>
      </Layout>
    );
  }

  if (error || !rfq) {
    return (
      <Layout title="Error">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Icon name="close-circle" className="fill-red-500 w-16 h-16 mb-4" />
          <h2 className="text-h5 mb-2">Error</h2>
          <p className="text-body-1 text-t-tertiary mb-6">{error || "RFQ not found"}</p>
          <Button isBlack onClick={() => router.push("/rfqs")}>Back to RFQs</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`RFQ ${rfq.id.slice(0, 8)}...`}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon="arrow-left"
              isWhite
              onClick={() => router.push("/rfqs")}
            />
            <div>
              <h1 className="text-h4">RFQ {rfq.id.slice(0, 8)}...</h1>
              <p className="text-body-2 text-t-tertiary">
                Created {new Date(rfq.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-body-2 font-medium ${statusColors[rfq.status]}`}
            >
              {rfq.status}
            </span>
            <Button isBlack onClick={() => setShowQuoteModal(true)}>
              Send Quote
            </Button>
            {rfq.status === "QUOTED" && (
              <Button isWhite onClick={() => handleUpdateStatus("ACCEPTED")}>
                Mark Accepted
              </Button>
            )}
            {rfq.status !== "CLOSED" && (
              <Button isWhite onClick={() => handleUpdateStatus("CLOSED")}>
                Close RFQ
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
          <Card title="Customer Information" className="p-6">
            <div className="space-y-3">
              <div>
                <div className="text-caption text-t-tertiary">Name</div>
                <div className="text-body-1">{rfq.customerName}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">Email</div>
                <div className="text-body-1">{rfq.customerEmail}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">Company</div>
                <div className="text-body-1">{rfq.companyName || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">Phone</div>
                <div className="text-body-1">{rfq.phone || "—"}</div>
              </div>
            </div>
          </Card>

          <Card title="Shipping Address" className="p-6">
            <div className="space-y-3">
              <div>
                <div className="text-caption text-t-tertiary">Address</div>
                <div className="text-body-1">
                  {(rfq.addressLines as any)?.line1}
                  {(rfq.addressLines as any)?.line2 && <>, {(rfq.addressLines as any).line2}</>}
                  {!rfq.addressLines && "—"}
                </div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">City</div>
                <div className="text-body-1">{rfq.addressCity || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">State</div>
                <div className="text-body-1">{rfq.addressState || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">Postal Code</div>
                <div className="text-body-1">{rfq.addressPostal || "—"}</div>
              </div>
              <div>
                <div className="text-caption text-t-tertiary">Country</div>
                <div className="text-body-1">{rfq.addressCountry || "—"}</div>
              </div>
            </div>
          </Card>
        </div>

        {rfq.additionalCustomerData && Object.keys(rfq.additionalCustomerData).length > 0 && (
          <Card title="Additional Information" className="p-6">
            <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
              {Object.entries(rfq.additionalCustomerData).map(([key, value]) => (
                <div key={key}>
                  <div className="text-caption text-t-tertiary">{key}</div>
                  <div className="text-body-1">{String(value)}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Items" className="p-6">
          <Table
            cellsThead={
              <>
                <th>Product</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Total</th>
              </>
            }
          >
            {rfq.items.map((item) => (
              <tr key={item.id} className="border-b border-s-subtle last:border-0">
                <td>
                  <div className="text-body-1 font-medium">{item.productName}</div>
                  {item.additionalData && Object.keys(item.additionalData as any).length > 0 && (
                    <div className="text-caption text-t-tertiary mt-1">
                      {Object.entries(item.additionalData as any)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" • ")}
                    </div>
                  )}
                </td>
                <td className="text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right font-medium">${item.lineTotal.toFixed(2)}</td>
              </tr>
            ))}
          </Table>
          <div className="mt-4 flex flex-col items-end gap-2">
            <div className="flex justify-between w-64 text-body-2">
              <span className="text-t-tertiary">Subtotal</span>
              <span>${rfq.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-body-2">
              <span className="text-t-tertiary">Tax</span>
              <span>${rfq.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-body-2">
              <span className="text-t-tertiary">Shipping</span>
              <span>${rfq.shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-64 text-h6 border-t border-s-subtle pt-2 mt-2">
              <span>Total</span>
              <span>${rfq.total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card title="Quote History" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-caption text-t-tertiary">Confirmation Email:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-caption ${rfq.confirmationEmailStatus === "SENT"
                  ? "bg-green-500/20 text-green-500"
                  : rfq.confirmationEmailStatus === "FAILED"
                    ? "bg-red-500/20 text-red-500"
                    : "bg-yellow-500/20 text-yellow-500"
                  }`}
              >
                {rfq.confirmationEmailStatus}
              </span>
            </div>
          </div>
          {(!rfq.quoteNotes || rfq.quoteNotes.length === 0) ? (
            <p className="text-body-2 text-t-tertiary">No quotes sent yet.</p>
          ) : (
            <div className="space-y-3">
              {rfq.quoteNotes.map((note) => (
                <div key={note.id} className="p-3 bg-b-surface2 rounded-lg border border-s-stroke2">
                  <div className="flex justify-between mb-1">
                    <div className="text-caption text-t-tertiary">
                      Sent {new Date(note.sentAt).toLocaleString()}
                    </div>
                    <div className={`text-caption ${note.emailStatus === "SENT" ? "text-green-500" : "text-red-500"}`}>
                      {note.emailStatus}
                    </div>
                  </div>
                  <div className="text-body-2 whitespace-pre-wrap">{note.messageBody}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Status History" className="p-6">
          {!rfq.statusHistory || rfq.statusHistory.length === 0 ? (
            <p className="text-body-2 text-t-tertiary">No status history found.</p>
          ) : (
            <div className="space-y-4">
              {rfq.statusHistory.map((history) => (
                <div key={history.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`size-2.5 rounded-full mt-1.5 ${statusColors[history.status].split(" ")[1].replace("text-", "bg-")}`}></div>
                    <div className="w-px grow bg-s-stroke2 my-1 last:hidden"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-body-1">{history.status}</span>
                      <span className="text-caption text-t-tertiary">{new Date(history.changedAt).toLocaleString()}</span>
                    </div>
                    {history.note && <p className="text-body-2 text-t-secondary mt-1">{history.note}</p>}
                    {history.changedBy && <p className="text-caption text-t-tertiary mt-0.5">By: {history.changedBy}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Raw JSON (Debug)" className="p-6">
          <button
            className="flex items-center gap-2 text-body-1 font-medium hover:text-t-secondary transition-colors"
            onClick={() => setShowRawJson(!showRawJson)}
          >
            <Icon
              name={showRawJson ? "chevron" : "chevron"}
              className={`fill-t-inherit transition-transform ${showRawJson ? "rotate-90" : ""}`}
            />
            View raw data
          </button>
          {showRawJson && (
            <pre className="mt-4 p-4 bg-b-surface2 rounded-lg text-body-2 overflow-x-auto border border-s-stroke2">
              {JSON.stringify(rfq, null, 2)}
            </pre>
          )}
        </Card>
      </div>

      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-shade-10/70 p-4 backdrop-blur-sm">
          <div className="bg-b-surface1 rounded-3xl p-8 w-full max-w-2xl shadow-depth border border-s-subtle animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h5">Send Quote</h2>
              <button
                className="p-2 hover:bg-b-surface2 rounded-full transition-colors"
                onClick={() => setShowQuoteModal(false)}
              >
                <Icon name="close" className="fill-t-secondary w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <label className="text-body-2 font-medium mb-2 block text-t-secondary">
                Message to Customer
              </label>
              <textarea
                className="w-full h-64 p-4 bg-b-surface2 rounded-xl text-body-1 resize-none focus:outline-none focus:ring-2 focus:ring-b-highlight border border-s-stroke2"
                placeholder="Enter your quote message..."
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button isGray onClick={() => setShowQuoteModal(false)}>
                Cancel
              </Button>
              <Button isBlack onClick={handleSendQuote} disabled={isSendingQuote}>
                {isSendingQuote ? "Sending..." : "Send Quote"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RFQDetailPage;
