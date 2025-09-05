import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Eye, EyeOff, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { useTermsConditions } from "@/hooks/use-terms-conditions";
import { cn } from "@/lib/utils";

// Hungarian cities with postal codes (sample data)
const HUNGARIAN_CITIES = [
  { name: "Budapest", postalCodes: ["1010", "1011", "1012", "1013", "1014", "1015", "1021", "1022"] },
  { name: "Debrecen", postalCodes: ["4024", "4025", "4026", "4027", "4028", "4029", "4030", "4031"] },
  { name: "Szeged", postalCodes: ["6720", "6721", "6722", "6723", "6724", "6725", "6726", "6727"] },
  { name: "Miskolc", postalCodes: ["3515", "3516", "3517", "3518", "3519", "3520", "3521", "3522"] },
  { name: "Pécs", postalCodes: ["7621", "7622", "7623", "7624", "7625", "7626", "7627", "7628"] },
  { name: "Győr", postalCodes: ["9021", "9022", "9023", "9024", "9025", "9026", "9027", "9028"] },
  { name: "Nyíregyháza", postalCodes: ["4400", "4401", "4402", "4403", "4404", "4405", "4406", "4407"] },
  { name: "Kecskemét", postalCodes: ["6000", "6001", "6002", "6003", "6004", "6005", "6006", "6007"] },
  { name: "Székesfehérvár", postalCodes: ["8000", "8001", "8002", "8003", "8004", "8005", "8006", "8007"] },
  { name: "Szombathely", postalCodes: ["9700", "9701", "9702", "9703", "9704", "9705", "9706", "9707"] },
  { name: "Szolnok", postalCodes: ["5000", "5001", "5002", "5003", "5004", "5005", "5006", "5007"] },
  { name: "Tatabánya", postalCodes: ["2800", "2801", "2802", "2803", "2804", "2805", "2806", "2807"] },
  { name: "Kaposvár", postalCodes: ["7400", "7401", "7402", "7403", "7404", "7405", "7406", "7407"] },
  { name: "Békéscsaba", postalCodes: ["5600", "5601", "5602", "5603", "5604", "5605", "5606", "5607"] },
  { name: "Zalaegerszeg", postalCodes: ["8900", "8901", "8902", "8903", "8904", "8905", "8906", "8907"] },
  { name: "Sopron", postalCodes: ["9400", "9401", "9402", "9403", "9404", "9405", "9406", "9407"] },
  { name: "Eger", postalCodes: ["3300", "3301", "3302", "3303", "3304", "3305", "3306", "3307"] },
  { name: "Nagykanizsa", postalCodes: ["8800", "8801", "8802", "8803", "8804", "8805", "8806", "8807"] },
  { name: "Dunaújváros", postalCodes: ["2400", "2401", "2402", "2403", "2404", "2405", "2406", "2407"] },
  { name: "Hódmezővásárhely", postalCodes: ["6800", "6801", "6802", "6803", "6804", "6805", "6806", "6807"] },
  { name: "Veszprém", postalCodes: ["8200", "8201", "8202", "8203", "8204", "8205", "8206", "8207"] },
  { name: "Szekszárd", postalCodes: ["7100", "7101", "7102", "7103", "7104", "7105", "7106", "7107"] },
  { name: "Salgótarján", postalCodes: ["3100", "3101", "3102", "3103", "3104", "3105", "3106", "3107"] },
  { name: "Baja", postalCodes: ["6500", "6501", "6502", "6503", "6504", "6505", "6506", "6507"] },
  { name: "Keszthely", postalCodes: ["8360", "8361", "8362", "8363", "8364", "8365", "8366", "8367"] }
];

const basicInfoSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  city: z.string().min(1, "Please select your city"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must contain at least 1 number")
    .regex(/[A-Z]/, "Password must contain at least 1 capital letter"),
  confirmPassword: z.string(),
  birthDate: z.date({
    required_error: "Birth date is required",
  }),
  acceptTerms: z.boolean().refine(val => val === true, "You must accept the privacy policy"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

interface BasicInfoStepProps {
  onNext: (data: BasicInfoFormData) => void;
  loading?: boolean;
}

export const BasicInfoStep = ({ onNext, loading }: BasicInfoStepProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date('2000-01-01'));
  const [postalCodeSearch, setPostalCodeSearch] = useState("");
  const { termsUrl } = useTermsConditions();

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      city: "",
      password: "",
      confirmPassword: "",
      birthDate: undefined, // Will be set by user
      acceptTerms: false,
    },
  });

  const password = form.watch("password") || "";

  const onSubmit = (data: BasicInfoFormData) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create Your Account</h2>
        <p className="text-muted-foreground">Fill in your basic information to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <div className="space-y-2">
                  {/* City Dropdown */}
                  <Select name='city' onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select your city in Hungary" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {HUNGARIAN_CITIES.map((city) => (
                        <SelectItem key={city.name} value={city.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{city.name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {city.postalCodes.slice(0, 2).join(", ")}...
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Postal Code Search */}
                  <div className="relative">
                    <Input
                      placeholder="Or enter postal code (e.g. 1011)"
                      value={postalCodeSearch}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPostalCodeSearch(value);
                        
                        // Find matching city when 4 digits are entered
                        if (value.length === 4) {
                          const matchingCity = HUNGARIAN_CITIES.find(city =>
                            city.postalCodes.includes(value)
                          );
                          if (matchingCity) {
                            field.onChange(matchingCity.name);
                            setPostalCodeSearch(""); // Clear the input after successful match
                          }
                        }
                      }}
                      maxLength={4}
                      className="pl-8"
                    />
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                {password && <PasswordStrengthMeter password={password} />}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => {
              const currentYear = new Date().getFullYear()- 18;
              const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
              const months = [
                { value: 0, label: "January" },
                { value: 1, label: "February" },
                { value: 2, label: "March" },
                { value: 3, label: "April" },
                { value: 4, label: "May" },
                { value: 5, label: "June" },
                { value: 6, label: "July" },
                { value: 7, label: "August" },
                { value: 8, label: "September" },
                { value: 9, label: "October" },
                { value: 10, label: "November" },
                { value: 11, label: "December" },
              ];

              const handleYearChange = (year: string) => {
                const newDate = new Date(calendarDate);
                newDate.setFullYear(parseInt(year));
                setCalendarDate(newDate);
              };

              const handleMonthChange = (month: string) => {
                const newDate = new Date(calendarDate);
                newDate.setMonth(parseInt(month));
                setCalendarDate(newDate);
              };

              return (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick your birth date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b">
                        <div className="flex gap-2">
                          <Select
                            value={calendarDate.getMonth().toString()}
                            onValueChange={handleMonthChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value.toString()}>
                                  {month.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={calendarDate.getFullYear().toString()}
                            onValueChange={handleYearChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        month={calendarDate}
                        onMonthChange={setCalendarDate}
                        disabled={(date) => {
                          const eighteenYearsAgo = new Date();
                          eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
                          return date > eighteenYearsAgo || date < new Date("1900-01-01");
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I accept the{" "}
                    {termsUrl ? (
                      <a 
                        href={termsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-4 hover:text-primary/80"
                      >
                        Privacy policy
                      </a>
                    ) : (
                      <span className="text-primary underline underline-offset-4">
                        Privacy policy
                      </span>
                    )}
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          {/* Company Registration CTA */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Are you a company looking to hire talent?
              </p>
                <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/company-register'}
                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                Register Your Company
                </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};