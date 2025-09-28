/**
 * Components Barrel Export
 * Central export point for all components in the application
 */

// Feature-specific components
export * from "./features";

// Shared/reusable components
export * from "./shared";
// UI components (Radix/Shadcn) - exclude ErrorBoundary to avoid conflict
export {
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";
export {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
export { Badge, badgeVariants } from "./ui/badge";
export { Button, buttonVariants } from "./ui/button";
export { Calendar } from "./ui/calendar";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
export { DatePicker } from "./ui/date-picker";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
export { Input } from "./ui/input";
export { Label } from "./ui/label";
export { LazyImage } from "./ui/lazy-image";
export {
  getCleanPhoneNumber,
  PhoneInput,
  type PhoneValue,
  validatePhoneNumber,
} from "./ui/phone-input";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
export { Progress } from "./ui/progress";
export { ScrollArea, ScrollBar } from "./ui/scroll-area";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
export { Separator } from "./ui/separator";
export { Skeleton } from "./ui/skeleton";
export { Slider } from "./ui/slider";
export { Toaster } from "./ui/sonner";
export { Switch } from "./ui/switch";
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
export { Textarea } from "./ui/textarea";
export { CustomTimePicker } from "./ui/time-picker";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
// Utility components (prioritize utils ErrorBoundary)
export * from "./utils";
