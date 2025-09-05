import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface CitySelectorProps {
  value?: string;
  onChange: (city: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  name?: string;
}

export const CitySelector = ({ 
  value, 
  onChange, 
  placeholder = "Select your city", 
  label,
  required = false,
  error,
  name
}: CitySelectorProps) => {
  const [postalCodeSearch, setPostalCodeSearch] = useState("");

  const handlePostalCodeChange = (postalCode: string) => {
    setPostalCodeSearch(postalCode);
    
    // Find matching city when 4 digits are entered
    if (postalCode.length === 4) {
      const matchingCity = HUNGARIAN_CITIES.find(city =>
        city.postalCodes.includes(postalCode)
      );
      if (matchingCity && onChange) {
        onChange(matchingCity.name);
        setPostalCodeSearch("");
      }
    }
  };

  return (
    <div className="space-y-2">
      {label?.trim() && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="space-y-2">
        {/* City Dropdown */}
        <Select name={name} value={value} onValueChange={onChange || (() => {})}>
          <SelectTrigger className="w-full">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
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
              handlePostalCodeChange(value);
            }}
            maxLength={4}
            className="pl-8"
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
