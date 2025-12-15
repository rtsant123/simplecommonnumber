"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { approvePayment, rejectPayment } from "@/actions/admin/payments";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

interface Payment {
  id: string;
  status: string;
}

export function PaymentActions({ payment }: { payment: Payment }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApprove(formData: FormData) {
    try {
      setLoading(true);
      formData.set("paymentId", payment.id);
      const result = await approvePayment(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment approved successfully");
        setApproveOpen(false);
      }
    } catch (error) {
      toast.error("Failed to approve payment");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject(formData: FormData) {
    try {
      setLoading(true);
      formData.set("paymentId", payment.id);
      const result = await rejectPayment(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Payment rejected");
        setRejectOpen(false);
      }
    } catch (error) {
      toast.error("Failed to reject payment");
    } finally {
      setLoading(false);
    }
  }

  if (payment.status !== "PENDING") {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => setApproveOpen(true)}
          disabled={loading}
        >
          <Check className="h-4 w-4 mr-1" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setRejectOpen(true)}
          disabled={loading}
        >
          <X className="h-4 w-4 mr-1" />
          Reject
        </Button>
      </div>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
            <DialogDescription>
              Approve this payment and activate the user's subscription
            </DialogDescription>
          </DialogHeader>
          <form action={handleApprove}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Any notes about this approval"
                  disabled={loading}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Approving..." : "Approve"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
            <DialogDescription>
              Reject this payment with a reason
            </DialogDescription>
          </DialogHeader>
          <form action={handleReject}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Rejection Reason *</Label>
                <Input
                  id="remarks"
                  name="remarks"
                  placeholder="Why is this payment being rejected?"
                  required
                  disabled={loading}
                />
              </div>
              <DialogFooter>
                <Button type="submit" variant="destructive" disabled={loading}>
                  {loading ? "Rejecting..." : "Reject"}
                </Button>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
