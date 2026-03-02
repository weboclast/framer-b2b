"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Select from "@/components/Select";
import Search from "@/components/Search";
import Icon from "@/components/Icon";
import type { RFQStatus, RFQListItem } from "@/types/rfq";

const statusOptions = [
  { id: 0, name: "All Status", slug: "all" },
  { id: 1, name: "Pending", slug: "PENDING" },
  { id: 2, name: "Quoted", slug: "QUOTED" },
  { id: 3, name: "Accepted", slug: "ACCEPTED" },
  { id: 4, name: "Closed", slug: "CLOSED" },
];

const statusColors: Record<RFQStatus, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-500",
  QUOTED: "bg-blue-500/20 text-blue-500",
  ACCEPTED: "bg-green-500/20 text-green-500",
  CLOSED: "bg-gray-500/20 text-gray-500",
};

const RFQsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rfqs, setRfqs] = useState<RFQListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialStatus = searchParams.get("status") || "all";
  const [statusFilter, setStatusFilter] = useState(
    statusOptions.find((opt) => opt.slug === initialStatus) || statusOptions[0]
  );
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchRfqs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter.slug !== "all") params.append("status", statusFilter.slug);
        if (searchQuery) params.append("query", searchQuery);

        const response = await fetch(`/api/rfq?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch RFQs");
        }
        const data = await response.json();
        setRfqs(data);
      } catch (err) {
        console.error("Error fetching RFQs:", err);
        setError("Could not load RFQs. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRfqs();
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [statusFilter, searchQuery]);

  const handleRowClick = (id: string) => {
    router.push(`/rfqs/${id}`);
  };

  return (
    <Layout title="RFQs">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4 max-md:block">
          <div className="flex items-center gap-3 max-md:mb-3">
            <Select
              classButton="bg-b-surface2 w-40"
              value={statusFilter}
              onChange={(val: any) => setStatusFilter(val)}
              options={statusOptions}
            />
          </div>
          <Search
            className="w-72 max-md:w-full"
            placeholder="Search by ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-body-2">
            {error}
          </div>
        )}

        <Card title="Latest RFQs" className={`overflow-hidden transition-opacity ${isLoading ? "opacity-50" : "opacity-100"}`}>
          <Table
            cellsThead={
              <>
                <th className="w-32">RFQ ID</th>
                <th className="w-32">Date</th>
                <th>Customer</th>
                <th className="w-40">Company</th>
                <th className="w-32 text-right">Total</th>
                <th className="w-28">Status</th>
              </>
            }
          >
            {rfqs.map((rfq) => (
              <tr
                key={rfq.id}
                className="border-b border-s-subtle last:border-0 hover:bg-b-surface2 transition-colors cursor-pointer"
                onClick={() => handleRowClick(rfq.id)}
              >
                <td className="font-mono text-body-2">{rfq.id.slice(0, 8)}...</td>
                <td className="text-body-2">{new Date(rfq.createdAt).toLocaleDateString()}</td>
                <td>
                  <div>
                    <div className="text-body-1 font-medium">{rfq.customerName}</div>
                    <div className="text-body-2 text-t-tertiary">{rfq.customerEmail}</div>
                  </div>
                </td>
                <td className="text-body-2">{rfq.companyName || "—"}</td>
                <td className="text-body-2 text-right font-medium">
                  ${rfq.total.toFixed(2)}
                </td>
                <td>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium ${statusColors[rfq.status]}`}
                  >
                    {rfq.status}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {rfqs.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="inbox" className="fill-t-tertiary w-16 h-16 mb-4" />
            <h3 className="text-h6 mb-2">No RFQs found</h3>
            <p className="text-body-2 text-t-tertiary">
              {searchQuery || statusFilter.slug !== "all"
                ? "Try adjusting your filters"
                : "RFQs from your Framer store will appear here"}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-body-2 text-t-tertiary">
            Showing {rfqs.length} RFQs
          </div>
          <div className="flex gap-2">
            <Button isStroke isGray>
              Previous
            </Button>
            <Button isStroke isGray>
              Next
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RFQsPage;
