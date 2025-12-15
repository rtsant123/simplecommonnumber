"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createSubscription } from "@/actions/subscription";
import { toast } from "sonner";
import { formatCurrency, getWhatsAppLink } from "@/lib/utils";
import { Check, MessageCircle } from "lucide-react";
import Image from "next/image";

interface SubscriptionPackage {
  id: string;
  name: string;
  days: number;
  price: number;
  description: string | null;
}

interface PaymentMethod {
  id: string;
  name: string;
  qrImageUrl: string;
  upiId: string | null;
}

export default function SubscriptionPage() {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [pkgRes, pmRes] = await Promise.all([
        fetch("/api/packages"),
        fetch("/api/payment-methods"),
      ]);
      const pkgData = await pkgRes.json();
      const pmData = await pmRes.json();
      setPackages(pkgData);
      setPaymentMethods(pmData);
    } catch (error) {
      toast.error("Failed to load data");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedPackage || !selectedPaymentMethod || !proofImage) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.set("packageId", selectedPackage);
      formData.set("paymentMethodId", selectedPaymentMethod);
      formData.set("proofImage", proofImage);

      const result = await createSubscription(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Subscription request submitted! Redirecting to WhatsApp...");
        setTimeout(() => {
          window.open(getWhatsAppLink(), "_blank");
        }, 1000);
        setSelectedPackage("");
        setSelectedPaymentMethod("");
        setProofImage(null);
        setShowQR(false);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  const selectedPkg = packages.find((p) => p.id === selectedPackage);
  const selectedPM = paymentMethods.find((p) => p.id === selectedPaymentMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose a plan and make payment</p>
      </div>

      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`cursor-pointer transition-all ${
              selectedPackage === pkg.id
                ? "ring-2 ring-primary"
                : "hover:shadow-lg"
            }`}
            onClick={() => {
              setSelectedPackage(pkg.id);
              setShowQR(false);
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
              <CardDescription>{pkg.days} days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(pkg.price)}
              </p>
            </CardContent>
            <CardFooter>
              {selectedPackage === pkg.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedPackage && (
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>
              Selected: {selectedPkg?.name} - {formatCurrency(selectedPkg?.price || 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Payment Method</Label>
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={(value) => {
                    setSelectedPaymentMethod(value);
                    setShowQR(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showQR && selectedPM && (
                <>
                  <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="p-4 bg-white rounded-lg border inline-block">
                      <Image
                        src={selectedPM.qrImageUrl}
                        alt="Payment QR Code"
                        width={200}
                        height={200}
                        className="rounded"
                      />
                    </div>
                    {selectedPM.upiId && (
                      <p className="text-sm text-muted-foreground">
                        UPI ID: {selectedPM.upiId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proof">Upload Payment Proof *</Label>
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*"
                      required
                      onChange={(e) => setProofImage(e.target.files?.[0] || null)}
                      disabled={loading}
                    />
                    <p className="text-sm text-muted-foreground">
                      Upload screenshot of payment confirmation
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit Payment"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(getWhatsAppLink(), "_blank")}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact on WhatsApp
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
