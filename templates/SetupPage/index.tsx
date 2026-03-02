"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

const SetupPage = () => {
  const { data: session } = useSession();
  const storeId = (session?.user as any)?.storeId || "Loading...";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title="Setup">
      <div className="max-w-3xl">
        <Card title="Onboarding" className="p-8">
          <h1 className="text-h4 mb-2">Welcome to Framer RFQ Hub</h1>
          <p className="text-body-2 text-t-tertiary mb-8">
            Set up your store to start receiving RFQs from your Framer website.
          </p>

          <div className="mb-8">
            <h2 className="text-h6 mb-4">Your Store ID</h2>
            <div className="flex gap-3">
              <div className="flex-1 bg-b-surface2 rounded-xl px-4 py-3 font-mono text-body-1">
                {storeId}
              </div>
              <Button
                icon={copied ? "check" : "copy"}
                isWhite
                onClick={copyToClipboard}
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-h6 mb-4">Integration Steps</h2>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-b-highlight flex items-center justify-center text-body-2 font-semibold shrink-0">
                  1
                </div>
                <div>
                  <p className="text-body-1 font-medium">Copy your Store ID</p>
                  <p className="text-body-2 text-t-tertiary">
                    Use the button above to copy your unique store identifier.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-b-highlight flex items-center justify-center text-body-2 font-semibold shrink-0">
                  2
                </div>
                <div>
                  <p className="text-body-1 font-medium">Add to Framer</p>
                  <p className="text-body-2 text-t-tertiary">
                    Paste your Store ID into the Framer RFQ component settings.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-b-highlight flex items-center justify-center text-body-2 font-semibold shrink-0">
                  3
                </div>
                <div>
                  <p className="text-body-1 font-medium">Configure Shipping</p>
                  <p className="text-body-2 text-t-tertiary">
                    Set up shipping rules in the Shipping section.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-b-highlight flex items-center justify-center text-body-2 font-semibold shrink-0">
                  4
                </div>
                <div>
                  <p className="text-body-1 font-medium">Customize Emails</p>
                  <p className="text-body-2 text-t-tertiary">
                    Configure email templates in Settings to match your brand.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-b-surface2 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <Icon name="info" className="fill-t-secondary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body-1 font-medium mb-1">API Documentation</h3>
                <p className="text-body-2 text-t-tertiary mb-3">
                  For advanced integrations, see our API documentation.
                </p>
                <a
                  href="/docs"
                  className="text-body-2 text-t-primary underline hover:no-underline"
                >
                  View Documentation →
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default SetupPage;
