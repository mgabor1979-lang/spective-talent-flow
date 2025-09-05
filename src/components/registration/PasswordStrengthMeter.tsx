import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthMeterProps {
  password: string;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const requirements = [
    { label: "At least 8 characters", test: (pwd: string) => pwd.length >= 8 },
    { label: "Contains at least 1 number", test: (pwd: string) => /\d/.test(pwd) },
    { label: "Contains at least 1 capital letter", test: (pwd: string) => /[A-Z]/.test(pwd) },
  ];

  const metRequirements = requirements.filter(req => req.test(password));
  const strength = (metRequirements.length / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strength <= 33) return "bg-destructive";
    if (strength <= 66) return "bg-warning";
    return "bg-success";
  };

  const getStrengthText = () => {
    if (strength <= 33) return "Weak";
    if (strength <= 66) return "Medium";
    return "Strong";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength</span>
        <span className="text-sm font-medium">{getStrengthText()}</span>
      </div>
      <Progress value={strength} className="h-2" />
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            {req.test(password) ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={req.test(password) ? "text-success" : "text-muted-foreground"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};