import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-8">Settings</h1>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div className="space-y-2">
          <p><span className="font-medium">Email:</span> {user?.email}</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;