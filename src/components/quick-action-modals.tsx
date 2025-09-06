"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PhoneInput,
  type PhoneValue,
  getCleanPhoneNumber,
  validatePhoneNumber,
} from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { qrFormatService } from "@/services/qr-format-service";
import { securityService } from "@/services/security-service";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  CreditCard,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Wifi,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (text: string) => void;
}

// WiFi Modal Component
export function WiFiModal({ open, onOpenChange, onGenerate }: BaseModalProps) {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState("WPA");
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ ssid?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validation
    if (!ssid.trim()) {
      setErrors({ ssid: "SSID is required" });
      setLoading(false);
      return;
    }

    try {
      const wifiString = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;

      // Security validation first
      const securityValidation = securityService.validateInput(
        wifiString,
        "wifi",
      );
      if (!securityValidation.isValid) {
        setErrors({
          ssid: `Security Error: ${securityValidation.errors.join(", ")}`,
        });
        setLoading(false);
        return;
      }

      // Show security warnings if any
      if (
        securityValidation.warnings.length > 0 &&
        securityValidation.riskLevel !== "low"
      ) {
        toast.warning("Security Warning", {
          description: securityValidation.warnings[0],
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 5000,
        });
      }

      // Validate and optimize format for maximum compatibility
      const validation = qrFormatService.validateAndOptimize(
        securityValidation.sanitizedInput || wifiString,
        "wifi",
      );

      if (!validation.isValid) {
        setErrors({ ssid: validation.errors.join(", ") });
        setLoading(false);
        return;
      }

      // Use optimized format
      const finalFormat = validation.optimizedFormat || wifiString;
      onGenerate(finalFormat);

      // Show warnings if any
      if (validation.warnings.length > 0) {
        toast.warning("WiFi QR code generated with warnings", {
          description: validation.warnings[0],
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 4000,
        });
      } else {
        toast.success("WiFi QR code generated!", {
          description: `Network: ${ssid} (${security} security) - Optimized for compatibility`,
          icon: <Check className="h-4 w-4" />,
          duration: 3000,
        });
      }

      onOpenChange(false);
      // Reset form
      setSsid("");
      setPassword("");
      setSecurity("WPA");
      setHidden(false);
    } catch (error) {
      toast.error("Failed to generate WiFi QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg transition-colors">
              <Wifi className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            WiFi Network
          </DialogTitle>
          <DialogDescription>
            Create a QR code for WiFi network connection
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ssid">Network Name (SSID) *</Label>
            <Input
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="Enter WiFi network name"
              className={errors.ssid ? "border-red-500" : ""}
            />
            {errors.ssid && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.ssid}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter WiFi password (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="security">Security Type</Label>
            <Select value={security} onValueChange={setSecurity}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WPA">WPA/WPA2</SelectItem>
                <SelectItem value="WEP">WEP</SelectItem>
                <SelectItem value="nopass">Open Network</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Phone Modal Component
export function PhoneModal({ open, onOpenChange, onGenerate }: BaseModalProps) {
  const [phone, setPhone] = useState<PhoneValue>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!phone) {
      setErrors({ phone: "Phone number is required" });
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setErrors({ phone: "Please enter a valid phone number" });
      setLoading(false);
      return;
    }

    try {
      const cleanPhone = getCleanPhoneNumber(phone);
      onGenerate(`tel:${cleanPhone}`);
      toast.success("Phone QR code generated!", {
        description: `Number: ${phone}`,
        icon: <Check className="h-4 w-4" />,
      });
      onOpenChange(false);
      setPhone(undefined);
    } catch (error) {
      toast.error("Failed to generate phone QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Phone Number
          </DialogTitle>
          <DialogDescription>
            Create a QR code for phone number dialing
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PhoneInput
            id="phone"
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            placeholder="Enter phone number"
            defaultCountry="ID"
            enableIPDetection={true}
            required
            error={errors.phone}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Email Modal Component
export function EmailModal({ open, onOpenChange, onGenerate }: BaseModalProps) {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: "Email address is required" });
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      setLoading(false);
      return;
    }

    try {
      let mailtoUrl = `mailto:${email}`;
      const params = [];
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length > 0) mailtoUrl += `?${params.join("&")}`;

      // Security validation first
      const securityValidation = securityService.validateInput(
        mailtoUrl,
        "email",
      );
      if (!securityValidation.isValid) {
        setErrors({
          email: `Security Error: ${securityValidation.errors.join(", ")}`,
        });
        setLoading(false);
        return;
      }

      // Show security warnings if any
      if (
        securityValidation.warnings.length > 0 &&
        securityValidation.riskLevel !== "low"
      ) {
        toast.warning("Security Warning", {
          description: securityValidation.warnings[0],
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 5000,
        });
      }

      // Validate and optimize format for maximum compatibility
      const validation = qrFormatService.validateAndOptimize(
        securityValidation.sanitizedInput || mailtoUrl,
        "email",
      );

      if (!validation.isValid) {
        setErrors({ email: validation.errors.join(", ") });
        setLoading(false);
        return;
      }

      // Use optimized format
      const finalFormat = validation.optimizedFormat || mailtoUrl;
      onGenerate(finalFormat);

      // Show warnings if any
      if (validation.warnings.length > 0) {
        toast.warning("Email QR code generated with warnings", {
          description: validation.warnings[0],
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 4000,
        });
      } else {
        toast.success("Email QR code generated!", {
          description: `To: ${email} - Optimized for compatibility`,
          icon: <Check className="h-4 w-4" />,
        });
      }

      onOpenChange(false);
      setEmail("");
      setSubject("");
      setBody("");
    } catch (error) {
      toast.error("Failed to generate email QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            Email
          </DialogTitle>
          <DialogDescription>
            Create a QR code for email composition
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Email message (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Location Modal Component
export function LocationModal({
  open,
  onOpenChange,
  onGenerate,
}: BaseModalProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ address?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!address.trim()) {
      setErrors({ address: "Address or location is required" });
      setLoading(false);
      return;
    }

    try {
      onGenerate(`geo:0,0?q=${encodeURIComponent(address)}`);
      toast.success("Location QR code generated!", {
        description: `Location: ${address}`,
        icon: <Check className="h-4 w-4" />,
      });
      onOpenChange(false);
      setAddress("");
    } catch (error) {
      toast.error("Failed to generate location QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <MapPin className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            Location
          </DialogTitle>
          <DialogDescription>
            Create a QR code for location or address
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address or Location *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address, landmark, or coordinates..."
              className={errors.address ? "border-red-500" : ""}
              rows={3}
            />
            {errors.address && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.address}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Examples: "123 Main St, City" or "Eiffel Tower, Paris"
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Event Modal Component
export function EventModal({ open, onOpenChange, onGenerate }: BaseModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; date?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: { title?: string; date?: string } = {};
    if (!title.trim()) newErrors.title = "Event title is required";
    if (!date) newErrors.date = "Event date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const eventDate = new Date(`${date}T${time}:00`);
      const formattedDate = `${eventDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;

      let eventString = `BEGIN:VEVENT\nSUMMARY:${title}\nDTSTART:${formattedDate}`;
      if (location) eventString += `\nLOCATION:${location}`;
      if (description) eventString += `\nDESCRIPTION:${description}`;
      eventString += "\nEND:VEVENT";

      onGenerate(eventString);
      toast.success("Event QR code generated!", {
        description: `Event: ${title}`,
        icon: <Check className="h-4 w-4" />,
      });
      onOpenChange(false);
      setTitle("");
      setDate("");
      setTime("12:00");
      setLocation("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to generate event QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Event
          </DialogTitle>
          <DialogDescription>
            Create a QR code for calendar event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting, Conference, etc."
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={errors.date ? "border-red-500" : ""}
              />
              {errors.date && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Website Modal Component
export function WebsiteModal({
  open,
  onOpenChange,
  onGenerate,
}: BaseModalProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ url?: string }>({});

  const validateUrl = (url: string) => {
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!url.trim()) {
      setErrors({ url: "Website URL is required" });
      setLoading(false);
      return;
    }

    const fullUrl = url.startsWith("http") ? url : `https://${url}`;
    if (!validateUrl(fullUrl)) {
      setErrors({ url: "Please enter a valid URL" });
      setLoading(false);
      return;
    }

    try {
      onGenerate(fullUrl);
      toast.success("Website QR code generated!", {
        description: `URL: ${fullUrl}`,
        icon: <Check className="h-4 w-4" />,
      });
      onOpenChange(false);
      setUrl("");
    } catch (error) {
      toast.error("Failed to generate website QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
              <Link2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            Website
          </DialogTitle>
          <DialogDescription>
            Create a QR code for website URL
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com or https://example.com"
              className={errors.url ? "border-red-500" : ""}
            />
            {errors.url && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.url}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Protocol (https://) will be added automatically if not provided
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// vCard Modal Component
export function VCardModal({ open, onOpenChange, onGenerate }: BaseModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<PhoneValue>();
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});

  const validateEmail = (email: string) => {
    if (!email) return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (email && !validateEmail(email))
      newErrors.email = "Please enter a valid email address";
    if (phone && !validatePhoneNumber(phone))
      newErrors.phone = "Please enter a valid phone number";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      let vCard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}`;
      if (phone) vCard += `\nTEL:${getCleanPhoneNumber(phone)}`;
      if (email) vCard += `\nEMAIL:${email}`;
      if (company) vCard += `\nORG:${company}`;
      if (title) vCard += `\nTITLE:${title}`;
      if (website) {
        const fullWebsite = website.startsWith("http")
          ? website
          : `https://${website}`;
        vCard += `\nURL:${fullWebsite}`;
      }
      vCard += "\nEND:VCARD";

      onGenerate(vCard);
      toast.success("Contact QR code generated!", {
        description: `Contact: ${name}`,
        icon: <Check className="h-4 w-4" />,
      });
      onOpenChange(false);
      setName("");
      setPhone(undefined);
      setEmail("");
      setCompany("");
      setTitle("");
      setWebsite("");
    } catch (error) {
      toast.error("Failed to generate contact QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Contact Card
          </DialogTitle>
          <DialogDescription>
            Create a QR code for contact information (vCard)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          <PhoneInput
            id="phone"
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            placeholder="Enter phone number"
            defaultCountry="ID"
            enableIPDetection={true}
            error={errors.phone}
          />

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="example.com"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// SMS Modal Component
interface SMSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (text: string) => void;
}

export function SMSModal({ open, onOpenChange, onGenerate }: SMSModalProps) {
  const [phone, setPhone] = useState<PhoneValue>();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!phone) {
      setErrors({ phone: "Phone number is required" });
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setErrors({ phone: "Please enter a valid phone number" });
      setLoading(false);
      return;
    }

    try {
      const cleanPhone = getCleanPhoneNumber(phone);
      let smsString = `sms:${cleanPhone}`;
      if (message.trim()) {
        smsString += `?body=${encodeURIComponent(message)}`;
      }

      // Validate and optimize format for maximum compatibility
      const validation = qrFormatService.validateAndOptimize(smsString, "sms");

      if (!validation.isValid) {
        setErrors({ phone: validation.errors.join(", ") });
        setLoading(false);
        return;
      }

      // Use optimized format
      const finalFormat = validation.optimizedFormat || smsString;
      onGenerate(finalFormat);

      // Show warnings if any
      if (validation.warnings.length > 0) {
        toast.warning("SMS QR code generated with warnings", {
          description: validation.warnings[0],
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 4000,
        });
      } else {
        toast.success("SMS QR code generated!", {
          description: `To: ${phone} - Optimized for compatibility`,
          icon: <Check className="h-4 w-4" />,
        });
      }

      onOpenChange(false);
      setPhone(undefined);
      setMessage("");
    } catch (error) {
      toast.error("Failed to generate SMS QR code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            SMS Message
          </DialogTitle>
          <DialogDescription>
            Create a QR code for SMS message
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PhoneInput
            id="sms-phone"
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            placeholder="Enter phone number"
            defaultCountry="ID"
            enableIPDetection={true}
            required
            error={errors.phone}
          />

          <div className="space-y-2">
            <Label htmlFor="sms-message">Message</Label>
            <Textarea
              id="sms-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message here (optional)"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Generate QR Code
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
