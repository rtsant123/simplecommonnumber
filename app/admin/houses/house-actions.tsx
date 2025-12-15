"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteHouse, toggleHouseStatus } from "@/actions/admin/houses";
import { toast } from "sonner";
import { Edit, Trash2, Power } from "lucide-react";
import Link from "next/link";

interface House {
  id: string;
  name: string;
  isActive: boolean;
}

export function HouseActions({ house }: { house: House }) {
  const [loading, setLoading] = useState(false);

  async function handleToggleStatus() {
    try {
      setLoading(true);
      const result = await toggleHouseStatus(house.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`House ${house.isActive ? "deactivated" : "activated"} successfully`);
      }
    } catch (error) {
      toast.error("Failed to update house status");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This will delete all related results and predictions.")) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteHouse(house.id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("House deleted successfully");
      }
    } catch (error) {
      toast.error("Failed to delete house");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Link href={`/admin/houses/${house.id}/edit`}>
        <Button size="sm" variant="outline">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        size="sm"
        variant="outline"
        onClick={handleToggleStatus}
        disabled={loading}
      >
        <Power className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={handleDelete}
        disabled={loading}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
