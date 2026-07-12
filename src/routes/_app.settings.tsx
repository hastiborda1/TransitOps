import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings — TransitOps" }, { name: "description", content: "Account, workspace and notification preferences." }] }),
  component: SettingsPage,
});

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().min(2),
});

function SettingsPage() {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "Alex Morgan", email: "alex@transitops.com", company: "TransitOps Logistics" },
  });

  return (
    <>
      <PageHeader title="Settings" description="Manage your account and workspace." />

      <Tabs defaultValue="profile" className="max-w-4xl">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">AM</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">Alex Morgan</p>
                <p className="text-xs text-muted-foreground">Fleet Manager</p>
                <Button variant="outline" size="sm" className="mt-2">Change avatar</Button>
              </div>
            </div>
            <Separator className="my-4" />
            <form onSubmit={handleSubmit((v) => { toast.success("Profile saved"); console.log(v); })} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" {...register("company")} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty}>Save changes</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="workspace" className="mt-4">
          <Card className="p-6 space-y-4">
            <SettingRow title="Default currency" desc="Used across expenses, fuel and analytics."><Input className="max-w-[120px]" defaultValue="USD" /></SettingRow>
            <SettingRow title="Distance unit" desc="Kilometers or miles."><Input className="max-w-[120px]" defaultValue="km" /></SettingRow>
            <SettingRow title="Timezone" desc="Used for scheduling trips."><Input className="max-w-[220px]" defaultValue="America/Los_Angeles" /></SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="p-6 space-y-4">
            <SettingRow title="Maintenance alerts" desc="Notify when a vehicle is due or overdue."><Switch defaultChecked /></SettingRow>
            <SettingRow title="Trip updates" desc="Get pinged when trip status changes."><Switch defaultChecked /></SettingRow>
            <SettingRow title="Weekly summary" desc="A recap of last week's performance."><Switch /></SettingRow>
            <SettingRow title="Expense approvals" desc="When an expense needs your sign-off."><Switch defaultChecked /></SettingRow>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="p-6 space-y-4">
            <SettingRow title="Two-factor authentication" desc="Extra layer of protection for your account."><Switch /></SettingRow>
            <SettingRow title="Active sessions" desc="You're signed in on 2 devices."><Button variant="outline" size="sm">Manage</Button></SettingRow>
            <SettingRow title="Change password" desc="Rotate periodically to stay secure."><Button variant="outline" size="sm">Update</Button></SettingRow>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function SettingRow({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
