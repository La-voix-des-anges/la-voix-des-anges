import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tags, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertTagSchema, type Tag, type InsertTag } from "@shared/schema";

export default function TagsAdminPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: tags = [], isLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const form = useForm<InsertTag>({
    resolver: zodResolver(insertTagSchema),
    defaultValues: { name: "", slug: "" },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const createMutation = useMutation({
    mutationFn: async (data: InsertTag) => apiRequest("POST", "/api/tags", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      setCreateDialogOpen(false);
      form.reset();
      toast({ title: "Tag créé", description: "Le tag a été créé avec succès." });
    },
    onError: () => toast({ title: "Erreur", description: "Impossible de créer le tag.", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tags"] });
      setDeleteId(null);
      toast({ title: "Tag supprimé", description: "Le tag a été supprimé avec succès." });
    },
    onError: () => toast({ title: "Erreur", description: "Impossible de supprimer le tag.", variant: "destructive" }),
  });

  const watchName = form.watch("name");
  const onSubmit = (data: InsertTag) => createMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-1">Gérez les tags pour les articles.</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-tag"><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau tag</DialogTitle>
              <DialogDescription>Créez un nouveau tag pour les articles.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input placeholder="Interview" {...field} data-testid="input-tag-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl><Input placeholder="interview" {...field} value={field.value || generateSlug(watchName)} data-testid="input-tag-slug" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-tag">Annuler</Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-tag">
                    {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création...</> : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : tags.length === 0 ? (
            <div className="p-12 text-center"><Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Aucun tag créé.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nom</TableHead><TableHead>Slug</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium" data-testid={`text-tag-name-${tag.id}`}>{tag.name}</TableCell>
                    <TableCell className="text-muted-foreground" data-testid={`text-tag-slug-${tag.id}`}>{tag.slug}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(String(tag.id))} disabled={deleteMutation.isPending} data-testid={`button-delete-tag-${tag.id}`}>
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                      <AlertDialog open={deleteId === String(tag.id)} onOpenChange={() => setDeleteId(null)}>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Supprimer le tag</AlertDialogTitle>
                            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer "{tag.name}" ?</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-testid="button-cancel-delete-tag">Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(String(tag.id))} data-testid="button-confirm-delete-tag">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
