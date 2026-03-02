"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Field from "@/components/Field";

const mockShippingRules = [
  { id: "rule-1", countryCode: null, isDefault: true, flatRate: 25.00 },
  { id: "rule-2", countryCode: "US", isDefault: false, flatRate: 15.00 },
  { id: "rule-3", countryCode: "CA", isDefault: false, flatRate: 25.00 },
  { id: "rule-4", countryCode: "GB", isDefault: false, flatRate: 35.00 },
  { id: "rule-5", countryCode: "DE", isDefault: false, flatRate: 35.00 },
];

const ShippingPage = () => {
  const [rules, setRules] = useState(mockShippingRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<typeof mockShippingRules[0] | null>(null);
  const [formData, setFormData] = useState({
    countryCode: "",
    flatRate: "0",
    isDefault: false,
  });

  const openAddModal = () => {
    setEditingRule(null);
    setFormData({ countryCode: "", flatRate: "0", isDefault: false });
    setModalOpen(true);
  };

  const openEditModal = (rule: typeof mockShippingRules[0]) => {
    setEditingRule(rule);
    setFormData({
      countryCode: rule.countryCode || "",
      flatRate: rule.flatRate.toString(),
      isDefault: rule.isDefault,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    const flatRate = parseFloat(formData.flatRate) || 0;
    
    if (editingRule) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingRule.id
            ? { ...r, countryCode: formData.countryCode || null, flatRate, isDefault: formData.isDefault }
            : r
        )
      );
    } else {
      setRules((prev) => [
        ...prev,
        {
          id: `rule-${Date.now()}`,
          countryCode: formData.countryCode || null,
          flatRate,
          isDefault: formData.isDefault,
        },
      ]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <Layout title="Shipping">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h4 mb-1">Shipping Rules</h1>
            <p className="text-body-2 text-t-tertiary">
              Configure flat-rate shipping costs by country
            </p>
          </div>
          <Button isBlack onClick={openAddModal}>
            Add Rule
          </Button>
        </div>

        <Card className="overflow-hidden">
          <Table
            cellsThead={
              <>
                <th>Country</th>
                <th className="text-right">Flat Rate</th>
                <th className="w-24">Default</th>
                <th className="w-24">Actions</th>
              </>
            }
          >
            {rules.map((rule) => (
              <tr key={rule.id} className="border-b border-s-subtle last:border-0">
                <td className="text-body-1">
                  {rule.countryCode ? (
                    <span className="font-medium">{rule.countryCode}</span>
                  ) : (
                    <span className="text-t-tertiary">All Countries (Default)</span>
                  )}
                </td>
                <td className="text-right text-body-1">${rule.flatRate.toFixed(2)}</td>
                <td>
                  {rule.isDefault && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-caption bg-b-highlight text-t-primary">
                      Default
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="p-2 hover:bg-b-surface2 rounded-lg transition-colors"
                      onClick={() => openEditModal(rule)}
                    >
                      <Icon name="edit" className="fill-t-secondary w-4 h-4" />
                    </button>
                    <button
                      className="p-2 hover:bg-b-surface2 rounded-lg transition-colors"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Icon name="trash" className="fill-t-secondary w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        {rules.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="truck" className="fill-t-tertiary w-16 h-16 mb-4" />
            <h3 className="text-h6 mb-2">No shipping rules</h3>
            <p className="text-body-2 text-t-tertiary mb-4">
              Add shipping rules to calculate shipping costs for your quotes.
            </p>
            <Button isBlack onClick={openAddModal}>
              Add Your First Rule
            </Button>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="p-8 w-full max-w-md">
          <h2 className="text-h5 mb-6">
            {editingRule ? "Edit Shipping Rule" : "Add Shipping Rule"}
          </h2>
          <div className="space-y-4">
            <Field
              label="Country Code"
              tooltip="Leave empty to make this the default rule for all countries"
              value={formData.countryCode}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, countryCode: e.target.value.toUpperCase() }))
              }
              placeholder="e.g., US, CA, GB"
            />
            <Field
              label="Flat Rate ($)"
              type="number"
              value={formData.flatRate}
              onChange={(e) => setFormData((prev) => ({ ...prev, flatRate: e.target.value }))}
              placeholder="0.00"
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="w-5 h-5 rounded border-s-subtle bg-b-surface2"
              />
              <span className="text-body-1">Set as default rule</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <Button isGray onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button isBlack onClick={handleSave}>
              {editingRule ? "Save Changes" : "Add Rule"}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default ShippingPage;
