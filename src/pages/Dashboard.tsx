import { PageTransition } from "@/components/PageTransition";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/use-auth";
import { useUploads, useCreateUpload } from "@/hooks/use-uploads";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUploadSchema, type InsertUpload } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, UploadCloud, FileImage } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: uploads, isLoading: uploadsLoading } = useUploads();
  const createUpload = useCreateUpload();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/api/login");
    }
  }, [user, isLoading, setLocation]);

  const form = useForm<InsertUpload>({
    resolver: zodResolver(insertUploadSchema),
    defaultValues: {
      filename: "",
      fileUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800", // Mock URL for demo
    },
  });

  const onSubmit = (data: InsertUpload) => {
    createUpload.mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  if (isLoading || !user) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <PageTransition>
      <Helmet>
        <title>Dashboard | VizAI Boost</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName || 'User'}</p>
          </div>
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="bg-card border border-white/10 p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <UploadCloud className="text-primary" /> New Project
            </h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="filename"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Summer Collection" className="bg-background border-white/10 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-8 border-2 border-dashed border-white/10 rounded-xl text-center hover:border-primary/50 transition-colors cursor-pointer bg-background/50">
                  <p className="text-sm text-muted-foreground">Drag & drop source images here<br/>(Demo Mode: Auto-fills URL)</p>
                </div>
                <Button 
                  type="submit" 
                  disabled={createUpload.isPending}
                  className="w-full bg-primary text-background font-bold"
                >
                  {createUpload.isPending ? "Uploading..." : "Start Generation"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Recent Uploads */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6">Recent Projects</h2>
            {uploadsLoading ? (
              <div className="text-muted-foreground">Loading projects...</div>
            ) : uploads?.length === 0 ? (
              <div className="text-muted-foreground p-8 border border-white/5 rounded-2xl text-center bg-card">
                No projects yet. Start your first generation!
              </div>
            ) : (
              <div className="space-y-4">
                {uploads?.map((upload) => (
                  <div key={upload.id} className="bg-card border border-white/10 p-4 rounded-xl flex items-center justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
                        <FileImage className="text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{upload.filename}</h4>
                        <p className="text-xs text-muted-foreground">{new Date(upload.createdAt!).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        upload.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {upload.status}
                      </span>
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
